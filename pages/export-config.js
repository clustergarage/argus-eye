import React from 'react'
import {connect} from 'react-redux'
import yaml from 'js-yaml'
import download from 'downloadjs'
import Clipboard from 'react-clipboard.js'
import {
  AlertTriangle,
  Box,
  Copy,
  Download,
} from 'react-feather'
import SyntaxHighlighter from 'react-syntax-highlighter'
import {github} from 'react-syntax-highlighter/dist/styles/hljs'
import ReactHintFactory from 'react-hint'
import 'react-hint/css/index.css'

import {VERSION} from '../constants'
import {mapState as mapSearchState, mapDispatch as mapSearchDispatch} from '../reducers/search'
import {mapState as mapConfigState, mapDispatch as mapConfigDispatch, EVENT_MAP} from '../reducers/object-config'
import {mapState as mapWatchersState, mapDispatch as mapWatchersDispatch} from '../reducers/watchers'
import {applyArgusWatcher} from '../lib/api'

const ReactHint = ReactHintFactory(React)
const COPY_TOOLTIP = (<span>Copy to clipboard</span>)
const COPIED_TOOLTIP = (<span><b>Copied</b> to clipboard!</span>)
const YAML_MIME = 'text/x-yaml'

class ExportConfig extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      name: this.props.objectConfig.metadata.name || '',
      namespace: this.props.objectConfig.metadata.namespace || '',
      tooltip: {
        json: COPY_TOOLTIP,
        yaml: COPY_TOOLTIP,
      },
    }

    this.handleNameChange = this.handleNameChange.bind(this)
    this.handleNamespaceChange = this.handleNamespaceChange.bind(this)
    this.handleDownloadClick = this.handleDownloadClick.bind(this)
    this.handleDeployToClusterClick = this.handleDeployToClusterClick.bind(this)
    this.handleTooltipClick = this.handleTooltipClick.bind(this)
    this.handleTooltipLeave = this.handleTooltipLeave.bind(this)
    this.onRenderTooltipContent = this.onRenderTooltipContent.bind(this)
  }

  componentDidUpdate({objectConfig: oldObjectConfig}) {
    const {namespace, name} = this.props.objectConfig.metadata
    if (namespace !== oldObjectConfig.metadata.namespace) {
      this.setState({namespace})
    }
    if (name !== oldObjectConfig.metadata.name) {
      this.setState({name})
    }
  }

  checkIsDisabled() {
    const {metadata, spec} = this.props.objectConfig
    const subjects = spec.subjects || []
    let subjectsOK = subjects.length > 0
    for (let i = 0; i < subjects.length; ++i) {
      if (!subjects[i].paths.length ||
        !subjects[i].events.length) {
        subjectsOK = false
        break
      }
    }
    return !metadata.name || !subjectsOK
  }

  getRequiredFields() {
    const {metadata, spec} = this.props.objectConfig
    let required = []

    if (!metadata.name) {
      required.push(<span><em>Metadata</em> &mdash; <b>name</b> is required.</span>)
    }
    if (!Object.keys(spec.selector.matchLabels).length) {
      required.push(<span><em>Spec</em> &mdash; label <b>selector</b> is required.</span>)
    }
    if (!spec.subjects.length) {
      required.push(<span><em>Spec</em> &mdash; at least one <b>subject</b> is required.</span>)
    }

    const subjects = spec.subjects || []
    for (let i = 0; i < subjects.length; ++i) {
      if (!subjects[i].paths.length) {
        required.push(<span><em>Subject {i}</em> &mdash; at least one <b>path</b> is required.</span>)
      }
      if (!subjects[i].events.length) {
        required.push(<span><em>Subject {i}</em> &mdash; at least one <b>event</b> is required.</span>)
      }
    }
    return required
  }

  handleNameChange(event) {
     this.setState({name: event.target.value})
    this.props.dispatchSetName(event.target.value)
  }

  handleNamespaceChange(event) {
    this.setState({namespace: event.target.value})
    this.props.dispatchSetNamespace(event.target.value)
  }

  handleDownloadClick() {
    const json = this.getObjectConfigJSON()
    const yaml = this.getObjectConfigYAML(json)
    download(yaml, `${this.props.objectConfig.metadata.name}-argus-watcher.yaml`, YAML_MIME)
  }

  async handleDeployToClusterClick() {
    const json = this.getObjectConfigJSON()
    const {namespace, name} = json.metadata
    const response = await applyArgusWatcher(namespace, name, json)
    if (this.props.editing !== null) {
      this.props.dispatchUpdateWatcher(response, this.props.editing)
      //this.props.dispatchSetEditing(null)
    } else {
      this.props.dispatchCreateWatcher(response)
    }
    this.props.dispatchReplaceConfigState(response)
    // @TODO: add spinner, message, complete, error
  }

  handleTooltipClick(key) {
    let tooltip = this.state.tooltip
    Object.keys(tooltip).map(k => tooltip[k] = key === k ? COPIED_TOOLTIP : COPY_TOOLTIP)
    this.setState({tooltip})
  }

  handleTooltipLeave(event, key) {
    event.preventDefault()
    this.setState({
      tooltip: {
        ...this.state.tooltip,
        [key]: COPY_TOOLTIP,
      }
    })
  }

  onRenderTooltipContent(key) {
    return <div className="react-hint__content">{this.state.tooltip[key]}</div>
  }

  getObjectConfigJSON() {
    // @TODO: better ES6 deep-copy
    let json = JSON.parse(JSON.stringify(this.props.objectConfig))

    const removeEmpty = obj => {
      const BOOLEAN_FLAGS = ['recursive', 'onlyDir', 'followMove']
      Object.keys(obj).forEach(key => {
        if (obj[key] &&
          typeof obj[key] === 'object') {
          removeEmpty(obj[key])
        } else if (obj[key] === undefined ||
          obj[key] === null) {
          delete obj[key]
        } else if (BOOLEAN_FLAGS.indexOf(key) > -1 &&
          obj[key] === false) {
          // keep config minimal by removing `false` value boolean flags
          delete obj[key]
        }
      })
    }

    const normalizeMetadata = json => {
      Object.keys(json.metadata).map(key => {
        if (json.metadata[key] === '') {
          delete json.metadata[key]
        }
      })

      let annotations = Object.assign({}, json.metadata.annotations, {
        'clustergarage.io/generated-by': 'argus-eye',
        'clustergarage.io/argus-eye.version': VERSION,
      })
      Object.keys(annotations).map(key => {
        if (key === 'kubectl.kubernetes.io/last-applied-configuration') {
          delete annotations[key]
        }
      })
    }

    const normalizeEvents = json => {
      json.spec.subjects.map(subject => {
        subject.events.map(event => {
          if (EVENT_MAP[event]) {
            subject.events = subject.events.filter(evt => !EVENT_MAP[event].includes(evt))
          }
        })
      })
    }

    const normalizeConfig = json => {
      Object.keys(json).map(key => {
        if (key === 'status') {
          delete json[key]
        }
      })
    }

    const defaultSortFn = (a, b) => a.localeCompare(b)
    const deepSort = (src, comparator) => {
      let out
      if (Array.isArray(src)) {
        return src.map(item => deepSort(item, comparator))
          .sort(comparator)
      }

      if (require('is-plain-object')(src)) {
        out = {}
        Object.keys(src)
          .sort(comparator || defaultSortFn)
          .forEach(key => out[key] = deepSort(src[key], comparator))
        return out
      }
      return src
    }

    removeEmpty(json)
    normalizeMetadata(json)
    normalizeEvents(json)
    normalizeConfig(json)
    return deepSort(json)
  }

  getObjectConfigYAML(json) {
    return `---\n${yaml.safeDump(json, {
      noArrayIndent: true,
      sortKeys: true,
    })}`
  }

  render() {
    const json = this.getObjectConfigJSON()
    const jsonFormatted = JSON.stringify(json, null, 2)
    const yamlFormatted = this.getObjectConfigYAML(json)

    return (
      <div className="container">
        <div className="row">
          <div className="column">
            <h3>
              <em>ArgusWatcher</em> Metadata
            </h3>
          </div>
        </div>
        <div className="row">
          <div className="column">
            <label>
              Name&nbsp;
              <small>(required)</small>
              <input type="text"
                value={this.state.name}
                disabled={this.props.editing !== null}
                onChange={this.handleNameChange}
                placeholder="mywatcher" />
            </label>
          </div>
          <div className="column">
            <label>
              Namespace
              <input type="text"
                value={this.state.namespace}
                disabled={this.props.editing !== null}
                onChange={this.handleNamespaceChange}
                placeholder="mynamespace" />
            </label>
          </div>
        </div>
        {this.checkIsDisabled() &&
        <div className="row">
          <div className="column required">
            <blockquote>
              <h5>
                <i><AlertTriangle size={22} /></i>
                Required fields
                </h5>
              <ul>
                {this.getRequiredFields().map((required, index) => (
                  <li key={index}>{required}</li>)
                )}
              </ul>
            </blockquote>
          </div>
        </div>}
        <div className="row">
          <div className="column buttons">
            <button type="button"
              className="button"
              disabled={this.checkIsDisabled()}
              onClick={this.handleDownloadClick}>
              <i><Download size={18} /></i>
              Download
            </button>
            <button type="button"
              className="button"
              disabled={this.checkIsDisabled()}
              onClick={this.handleDeployToClusterClick}>
              <i><Box size={18} /></i>
              Deploy to cluster
            </button>
          </div>
        </div>
        <div className="row">
          <div className="column column-50">
            <h3>YAML</h3>
            <div className="output-syntax">
              <ReactHint attribute="data-yaml"
                position="top"
                events={{hover: true}}
                onRenderContent={() => this.onRenderTooltipContent('yaml')} />
              <div className="copy-clipboard"
                data-yaml={this.state.tooltip.yaml}
                onClick={() => this.handleTooltipClick('yaml')}
                onMouseLeave={event => this.handleTooltipLeave(event, 'yaml')}>
                <Clipboard component="div"
                  data-clipboard-text={yamlFormatted}>
                  <i><Copy size={18} /></i>
                </Clipboard>
              </div>
              <SyntaxHighlighter language="yaml" style={github}>
                {yamlFormatted}
              </SyntaxHighlighter>
            </div>
          </div>
          <div className="column column-50">
            <h3>JSON</h3>
            <div className="output-syntax">
              <ReactHint attribute="data-json"
                position="top"
                events={{hover: true}}
                onRenderContent={() => this.onRenderTooltipContent('json')} />
              <div className="copy-clipboard"
                data-json={this.state.tooltip.json}
                onClick={() => this.handleTooltipClick('json')}
                onMouseLeave={event => this.handleTooltipLeave(event, 'json')}>
                <Clipboard component="div"
                  data-clipboard-text={jsonFormatted}>
                  <i><Copy size={18} /></i>
                </Clipboard>
              </div>
              <SyntaxHighlighter language="json" style={github}>
                {jsonFormatted}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>

        <style jsx>{`
        .buttons {
          border-bottom: 2px solid #d9e2ec;
          margin-bottom: 2rem;
          padding-bottom: 2rem;
        }

        .button {
          margin-right: 1rem;
        }

        .button i {
          vertical-align: sub;
          vertical-align: -webkit-baseline-middle;
          margin-right: 1rem;
        }

        .output-syntax {
          position: relative;
        }
        `}</style>
        <style global jsx>{`
        .required blockquote {
          font-family: 'Ubuntu Mono', monospace;
          background-color: #f7f8fa;
          border-left-color: #e12d39;
          padding: 2rem;
        }

        .required blockquote h5 {
          font-size: 1.6rem;
        }

        .required blockquote h5 i {
          color: #cf1124;
          vertical-align: sub;
          vertical-align: -webkit-baseline-middle;
          margin-right: 1rem;
        }

        .required blockquote li {
          font-size: 1.4rem;
          list-style: disc;
          margin: 0 0 0.25rem 2rem;
          padding-left: 1rem;
        }

        .required blockquote li em {
          color: #000;
          background-color: #ffe3e3;
          font-style: normal;
          padding: 0.2rem 0.4rem;
        }

        .copy-clipboard {
          position: absolute;
          top: 0.6rem;
          right: 0.75rem;
        }

        .copy-clipboard [data-clipboard-text] {
          height: 18px;
        }

        .copy-clipboard i {
          color: #a368fc;
          cursor: pointer;
        }

        .copy-clipboard:hover i {
          color: #7a0ecc;
        }

        .output-syntax pre,
        .output-syntax code {
          background-color: transparent;
        }

        .output-syntax code {
          padding: 1.5rem 1rem;
        }
        `}</style>
      </div>
    )
  }
}

const mapState = state => (Object.assign({},
  mapSearchState(state),
  {objectConfig: mapConfigState(state)},
  mapWatchersState(state)))

const mapDispatch = dispatch => (Object.assign({},
  mapSearchDispatch(dispatch),
  mapConfigDispatch(dispatch),
  mapWatchersDispatch(dispatch)))

export default connect(mapState, mapDispatch)(ExportConfig)
