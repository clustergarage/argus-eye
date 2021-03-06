import React from 'react'
import {connect} from 'react-redux'

import {mapState, mapDispatch} from '../reducers/search'
import {searchPods, podContainers, containerPID} from '../lib/api'

class Search extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      labelSelector: this.props.labelSelector || '',
    }

    this.handleLabelSelectorChange = this.handleLabelSelectorChange.bind(this)
    this.handleLabelSelectorSubmit = this.handleLabelSelectorSubmit.bind(this)
    this.handleContainerClick = this.handleContainerClick.bind(this)
  }

  componentDidUpdate({labelSelector: oldLabelSelector}) {
    const {labelSelector} = this.props
    if (labelSelector !== oldLabelSelector) {
      this.setState({labelSelector})
    }
  }

  handleLabelSelectorChange(event) {
    this.setState({labelSelector: event.target.value})
  }

  async handleLabelSelectorSubmit(event) {
    event.preventDefault()

    this.props.dispatchSetLabelSelector(this.state.labelSelector)
    // bubble up labelSelector state so we can inform objectConfig
    this.props.onSelectorSubmit && this.props.onSelectorSubmit(this.state.labelSelector)

    const pods = await this.loadPods()
    if (pods.length) {
      const containers = await this.selectPod(pods[0])
      if (containers.length === 1) {
        this.selectContainer(containers[0].containerID)
      } else {
        // make the user choose
        this.props.dispatchSetContainers(containers.map(container => {
          return Object.keys(container)
            .filter(key => ['containerID', 'name', 'ready'].includes(key))
            .reduce((obj, key) => {
              obj[key] = container[key]
              return obj
            }, {})
        }))
      }
    }
  }

  async handleContainerClick(cid) {
    this.selectContainer(cid)
  }

  // @TODO: store in a shared location [for pages/index | pages/watchers]
  async loadPods() {
    const pods = await searchPods(this.state.labelSelector)
    this.props.dispatchSetPods(pods.map(pod => ({
      metadata: Object.keys(pod.metadata)
        .filter(key => ['uid', 'namespace', 'name'].includes(key))
        .reduce((obj, key) => {
          obj[key] = pod.metadata[key]
          return obj
        }, {}),
      status: Object.keys(pod.status)
        .filter(key => ['phase'].includes(key))
        .reduce((obj, key) => {
          obj[key] = pod.status[key]
          return obj
        }, {}),
    })))
    return pods
  }

  async selectPod(pod) {
    const {namespace, name} = pod.metadata
    const containers = await podContainers(namespace, name)
    return containers
  }

  async selectContainer(cid) {
    const pid = await containerPID(cid)
    this.props.onLoadRootDirectory && this.props.onLoadRootDirectory(cid, `/proc/${pid}/root`)
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleLabelSelectorSubmit}>
          <label>
            Label selector
            <input type="text"
              value={this.state.labelSelector}
              onChange={this.handleLabelSelectorChange}
              placeholder="app=myapp" />
          </label>
          <input type="submit" value="Submit" />
        </form>

        {this.props.pods.length > 0 &&
        <label className="found-pods">
          Found <em>{this.props.pods.length}</em> pod{this.props.pods.length !== 1 && 's'}
          <div>
            {this.props.pods.map(pod => (
            <a key={pod.metadata.uid}>
              <span>{pod.metadata.namespace}/</span>
              {pod.metadata.name}
              {pod.status && <span>&nbsp;(<em>{pod.status.phase}</em>)</span>}
            </a>
            ))}
          </div>
        </label>}

        {this.props.containers.length > 0 &&
        <div className="container-select">
          <label>
            Pod has <em>{this.props.containers.length}</em> containers; choose to view filesystem
          </label>
          {this.props.containers.map(container => (
            <a key={container.containerID}
              disabled={!container.ready}
              className={`button button-small ${this.props.selectedContainer !== container.containerID ? 'button-outline' : ''}`}
              onClick={() => this.handleContainerClick(container.containerID)}>
              {container.name}
              {!container.ready && <span>&nbsp;(not ready)</span>}
            </a>
          ))}
        </div>}

        <style jsx>{`
          form {
            margin-bottom: 2rem;
          }

          input[type="text"] {
            color: #627d98;
            font: 1.6rem 'Ubuntu Mono', monospace;
          }

          a.button {
            margin-right: 1rem;
          }

          .found-pods em,
          .container-select em {
            padding: 0.2rem 0.4rem;
          }

          .found-pods {
            margin-bottom: 1rem;
          }

          .found-pods a {
            display: inline-block;
            color: #486581;
            font: 1.4rem 'Ubuntu Mono', monospace;
            font-weight: normal;
            margin-right: 3rem;
          }

          .found-pods a span {
            color: #9fb3c8;
          }

          .found-pods a span em {
            background-color: #f2ebfe;
            padding: 0.1rem 0.2rem;
          }

          .container-select {
            margin-top: 2rem;
          }

          .container-select .button {
            margin-top: 0.5rem;
          }
        `}</style>
      </div>
    )
  }
}

export default connect(mapState, mapDispatch)(Search)
