import React from 'react'
import {connect} from 'react-redux'
import {CornerDownRight, Eye} from 'react-feather'

import Layout from '../components/Layout'
import FileTree from '../components/FileTree'
import {mapState, mapDispatch} from '../reducers/search'
import {searchPods, podContainers, containerPID} from '../lib/api'

class Index extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selector: this.props.selector || '',
      pods: this.props.pods || [],
      selectedPod: this.props.selectedPod || '',
      containers: this.props.containers || [],
      selectedContainer: this.props.selectedContainer || '',
      directory: this.props.directory || '',
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
    this.loadPods()
  }

  async handlePodClick(pod) {
    this.loadContainers(pod)
  }

  async handleContainerClick(id) {
    this.loadRootDirectory(id)
  }

  async loadPods() {
    const pods = await searchPods(this.state.selector)
    this.setState({pods})
    this.props.dispatchLoadPods(pods)
  }

  async loadContainers(pod) {
    const {uid, namespace, name} = pod.metadata
    this.setState({selectedPod: uid})
    const containers = await podContainers(namespace, name)
    this.setState({containers})
    this.props.dispatchLoadContainers(uid, containers)
  }

  async loadRootDirectory(cid) {
    this.setState({selectedContainer: cid})
    const pid = await containerPID(cid)
    const directory = `/proc/${pid}/root`
    this.setState({directory})
    this.props.dispatchLoadRootDirectory(cid, directory)
  }

  render() {
    let podsHeader, containersHeader, fsHeader
    if (this.state.pods.length) {
      podsHeader = <h4>Found pods</h4>
    }
    if (this.state.directory) {
      fsHeader = (
        <h2>
          File Viewer&nbsp;
          <small>(PID: {this.state.directory.split('/')[2]})</small>

          <style jsx>{`
            small {
              font: 1.75rem "Ubuntu Mono", monospace;
            }
          `}</style>
        </h2>
      )
    }

    return (
      <Layout>
        <h1>
          Argus
          <i><Eye size={48} /></i>
        </h1>

        <form onSubmit={this.handleSelectorSubmit}>
          <label>
            Label selector:
            <input type="text"
              value={this.state.selector}
              onChange={this.handleSelectorChange} />
          </label>
          <input type="submit" value="Submit" />
        </form>

        {podsHeader}
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

        <div className="file-viewer">
          {fsHeader}
          <FileTree directory={this.state.directory} />
        </div>

        <style jsx>{`
          h1 i {
            vertical-align: sub;
            margin: 1rem 0 0 1rem;
          }

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

          .file-viewer {
            margin-top: 4rem;
          }
        `}</style>
      </Layout>
    )
  }
}

export default connect(mapState, mapDispatch)(Index)
