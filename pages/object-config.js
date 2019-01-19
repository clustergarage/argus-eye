import React from 'react'
import {connect} from 'react-redux'
import download from 'downloadjs'
import Clipboard from 'react-clipboard.js'
import {Box, Copy, Download} from 'react-feather'
import SyntaxHighlighter from 'react-syntax-highlighter'
import {github} from 'react-syntax-highlighter/dist/styles/hljs'
import ReactHintFactory from 'react-hint'
import 'react-hint/css/index.css'

import Layout from '../components/Layout'
import {json2yaml} from '../lib/json2yaml'

const ReactHint = ReactHintFactory(React)
const COPY_TOOLTIP = 'Copy to clipboard.'
const COPIED_TOOLTIP = 'Copied to clipboard!'

class ObjectConfig extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      tooltip: {
        json: COPY_TOOLTIP,
        yaml: COPY_TOOLTIP,
      },
    }

    this.handleDownloadClick = this.handleDownloadClick.bind(this)
    this.handleDeployToClusterClick = this.handleDeployToClusterClick.bind(this)
    this.handleTooltipClick = this.handleTooltipClick.bind(this)
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
            <div className="column buttons">
              <button type="button"
                className="button"
                onClick={this.handleDownloadClick}>
                <i><Download size={18} /></i>
                Download
              </button>
              <button type="button"
                className="button"
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
                  events={{hover: true}} />
                <div className="copy-clipboard"
                  data-yaml={this.state.tooltip.yaml}
                  onClick={() => this.handleTooltipClick('yaml')}>
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
                  events={{hover: true}} />
                <div className="copy-clipboard"
                  data-json={this.state.tooltip.json}
                  onClick={() => this.handleTooltipClick('json')}>
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
        .output-syntax {
          position: relative;
        }

        .buttons {
          border-bottom: 2px solid #d9e2ec;
          margin-bottom: 2rem;
          padding-bottom: 2rem;
        }

        .button {
          /*color: #000;
          background-color: #c6f7e2;
          border-color: #c6f7e2;*/
          margin-right: 1rem;
        }

        .button:hover {
          /*color: #fff;
          background-color: #606c76;
          border-color: #606c76;*/
        }

        .button i {
          vertical-align: sub;
          margin-right: 1rem;
        }
        `}</style>
      </Layout>
    )
  }
}

export const mapState = state => ({
  objectConfig: state.objectConfig,
})

export default connect(mapState)(ObjectConfig)
