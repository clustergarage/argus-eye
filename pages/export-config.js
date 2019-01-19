import React from 'react'
import {connect} from 'react-redux'
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

import Layout from '../components/Layout'
import {json2yaml} from '../lib/json2yaml'
import {mapState as mapConfigState, mapDispatch} from '../reducers/object-config'

const ReactHint = ReactHintFactory(React)
const COPY_TOOLTIP = (<span>Copy to clipboard.</span>)
const COPIED_TOOLTIP = (<span><b>Copied</b> to clipboard!</span>)

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

  handleDownloadClick(event) {
    download(json2yaml(this.getObjectConfigJSON()),
      `${this.props.objectConfig.metadata.name}-argus-watcher.yaml`,
      'text/x-yaml')
  }

  handleDeployToClusterClick(event) {
    const json = this.getObjectConfigJSON()
  }

  handleTooltipClick(key) {
    let tooltip = this.state.tooltip
    Object.keys(tooltip).map(k => tooltip[k] = key === k ? COPIED_TOOLTIP : COPY_TOOLTIP)
    this.setState({tooltip})
  }

  handleTooltipLeave(event, key) {
    event.preventDefault()
    this.setState({tooltip: {...this.state.tooltip, [key]: COPY_TOOLTIP}})
  }

  onRenderTooltipContent(key) {
    return (<div className="react-hint__content">{this.state.tooltip[key]}</div>)
  }

  getObjectConfigJSON() {
    const json = (this.props.objectConfig || {})

    const removeEmpty = obj => {
      Object.keys(obj).forEach(key => {
        if (obj[key] &&
          typeof obj[key] === 'object') {
          removeEmpty(obj[key])
        } else if (obj[key] === null) {
          delete obj[key]
        }
      })
    }

    removeEmpty(json)
    return json
  }

  render() {
    const json = this.getObjectConfigJSON()
    const jsonFormatted = JSON.stringify(json, null, 2)
    const yamlFormatted = json2yaml(json)

    return (
      <Layout>
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
                  onChange={this.handleNameChange}
                  placeholder="mywatcher" />
              </label>
            </div>
            <div className="column">
              <label>
                Namespace
                <input type="text"
                  value={this.state.namespace}
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
                  <i><AlertTriangle size={24} /></i>
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
            <div className="column">
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
            <div className="column">
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
          margin-right: 1rem;
        }

        .output-syntax {
          position: relative;
        }
        `}</style>
      </Layout>
    )
  }
}

const mapState = state => (Object.assign({}, {
  objectConfig: mapConfigState(state),
}))

export default connect(mapState, mapDispatch)(ExportConfig)
