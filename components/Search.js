import React from 'react'
import {connect} from 'react-redux'
import {CornerDownRight} from 'react-feather'

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
    this.handlePodClick = this.handlePodClick.bind(this)
    this.handleContainerClick = this.handleContainerClick.bind(this)
  }

  handleLabelSelectorChange(event) {
    this.setState({labelSelector: event.target.value})
  }

  async handleLabelSelectorSubmit(event) {
    event.preventDefault()
    this.props.dispatchSetLabelSelector(this.state.labelSelector)
    // bubble up labelSelector state so we can inform objectConfig
    this.props.onSelectorSubmit && this.props.onSelectorSubmit(this.state.labelSelector)

    const pods = await searchPods(this.state.labelSelector)
    this.props.dispatchSetPods(pods.map(pod => ({
      metadata: Object.keys(pod.metadata)
        .filter(key => ['uid', 'namespace', 'name'].includes(key))
        .reduce((obj, key) => {
          obj[key] = pod.metadata[key]
          return obj
        }, {})
    })))
  }

  async handlePodClick(pod) {
    const {uid, namespace, name} = pod.metadata
    const containers = await podContainers(namespace, name)
    this.props.dispatchSetContainers(uid, containers.map(container => {
      return Object.keys(container)
        .filter(key => ['containerID', 'name'].includes(key))
        .reduce((obj, key) => {
          obj[key] = container[key]
          return obj
        }, {})
    }))
  }

  async handleContainerClick(cid) {
    const pid = await containerPID(cid)
    this.props.onLoadRootDirectory && this.props.onLoadRootDirectory(cid, `/proc/${pid}/root`)
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleLabelSelectorSubmit}>
          <label>
            Label selector:
            <input type="text"
              value={this.state.labelSelector}
              onChange={this.handleLabelSelectorChange} />
          </label>
          <input type="submit" value="Submit" />
        </form>

        {this.props.pods.length > 0 && <h4>Found pods</h4>}
        {this.props.pods.map(pod => (
          <a key={pod.metadata.uid}
            className={`button ${this.props.selectedPod !== pod.metadata.uid ? 'button-outline' : ''}`}
            onClick={() => this.handlePodClick(pod)}>
            {pod.metadata.name}
          </a>
        ))}

        {this.props.containers.length > 0 &&
        <div className="container-select">
          <i><CornerDownRight size={28} /></i>
          {this.props.containers.map(container => (
            <a key={container.containerID}
              className={`button ${this.props.selectedContainer !== container.containerID ? 'button-outline' : ''}`}
              onClick={() => this.handleContainerClick(container.containerID)}>
              {container.name}
            </a>
          ))}
        </div>}

        <style jsx>{`
          input[type="text"] {
            color: #627d98;
            font: 1.6rem 'Ubuntu Mono', monospace;
          }

          a.button {
            margin-right: 1rem;
          }

          .container-select i {
            vertical-align: sub;
            margin-right: 0.5rem;
          }
        `}</style>
      </div>
    )
  }
}

export default connect(mapState, mapDispatch)(Search)
