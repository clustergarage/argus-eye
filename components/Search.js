import React from 'react'
import {connect, Provider} from 'react-redux'
import {CornerDownRight} from 'react-feather'

import {mapState, mapDispatch} from '../reducers/search'
import {searchPods, podContainers, containerPID} from '../lib/api'

class Search extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selector: this.props.selector || '',
      pods: this.props.pods || [],
      selectedPod: this.props.selectedPod || '',
      containers: this.props.containers || [],
      selectedContainer: this.props.selectedContainer || '',
    }

    this.handleSelectorChange = this.handleSelectorChange.bind(this)
    this.handleSelectorSubmit = this.handleSelectorSubmit.bind(this)
    this.handlePodClick = this.handlePodClick.bind(this)
    this.handleContainerClick = this.handleContainerClick.bind(this)
  }

  handleSelectorChange(event) {
    this.setState({selector: event.target.value})
  }

  async handleSelectorSubmit(event) {
    event.preventDefault()
    this.props.dispatchLoadSelector(this.state.selector)

    const pods = await searchPods(this.state.selector)
    this.setState({pods})
    this.props.dispatchLoadPods(pods.map(pod => {
      return {
        metadata: Object.keys(pod.metadata)
          .filter(key => ['uid', 'namespace', 'name'].includes(key))
          .reduce((obj, key) => {
            obj[key] = pod.metadata[key]
            return obj
          }, {})
      }
    }))
  }

  async handlePodClick(pod) {
    const {uid, namespace, name} = pod.metadata
    this.setState({selectedPod: uid})

    const containers = await podContainers(namespace, name)
    this.setState({containers})
    this.props.dispatchLoadContainers(uid, containers.map(container => {
      return Object.keys(container)
        .filter(key => ['containerID', 'name'].includes(key))
        .reduce((obj, key) => {
          obj[key] = container[key]
          return obj
        }, {})
    }))
  }

  async handleContainerClick(cid) {
    this.setState({selectedContainer: cid})
    const pid = await containerPID(cid)
    this.props.onLoadRootDirectory && this.props.onLoadRootDirectory(cid, `/proc/${pid}/root`)
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSelectorSubmit}>
          <label>
            Label selector:
            <input type="text"
              value={this.state.selector}
              onChange={this.handleSelectorChange} />
          </label>
          <input type="submit" value="Submit" />
        </form>

        {this.state.pods.length > 0 && <h4>Found pods</h4>}
        {this.state.pods.map(pod => (
          <a key={pod.metadata.uid}
            className={`button ${this.state.selectedPod !== pod.metadata.uid ? 'button-outline' : ''}`}
            onClick={() => this.handlePodClick(pod)}>
            {pod.metadata.name}
          </a>
        ))}

        {this.state.containers.length > 0 &&
          <div className="container-select">
            <i><CornerDownRight size={28} /></i>
            {this.state.containers.map(container => (
              <a key={container.containerID}
                className={`button ${this.state.selectedContainer !== container.containerID ? 'button-outline' : ''}`}
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
