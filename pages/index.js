import React from 'react'
import {connect} from 'react-redux'
import {CornerDownRight, Eye} from 'react-feather'

import Layout from '../components/Layout'
import FileTree from '../components/FileTree'
import {
  searchPods,
  podContainers,
  containerPID,
  loadFSTree,
} from '../lib/api'

class Index extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selector: '',   // k8s label selector to find pods
      pods: [],       // list of current searched pods
      containers: [], // optional picker for when multiple containers are in a single selected pod
      files: [],      // selected pids filesystem tree
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
    const pods = await searchPods(this.state.selector)
    this.setState({pods})
  }

  async handlePodClick({uid, namespace, name}) {
    this.setState({selectedPod: uid})
    // @TODO: if only one container status comes back, immediately pick that PID
    const containers = await podContainers(namespace, name)
    this.setState({containers})
  }

  async handleContainerClick(id) {
    this.setState({
      selectedContainer: id,
      isLoading: true,
    })
    const pid = await containerPID(id)
    this.setState({
      directory: `/proc/${pid}/root`,
      isLoading: false,
    })
  }

  render() {
    let podsHeader, containersHeader, fsHeader
    if (this.state.pods.length) {
      podsHeader = <h2>Pods</h2>
    }
    if (this.state.directory) {
      fsHeader = (
        <h4>
          Filesystem&nbsp;
          <small>({this.state.directory})</small>
        </h4>
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
            onClick={() => this.handlePodClick(pod.metadata)}>
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

        {fsHeader}
        <FileTree directory={this.state.directory} />

        <style jsx>{`
          h1 i {
            vertical-align: sub;
            margin: 1rem 0 0 1rem;
          }

          a.button {
            margin-right: 1rem;
          }

          .container-select i {
            vertical-align: sub;
            margin-right: 0.5rem;
          }
        `}</style>
      </Layout>
    )
  }
}

export default connect()(Index)
