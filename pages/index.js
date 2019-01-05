import React from 'react'
import {connect} from 'react-redux'

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
      selector: '',     // k8s label selector to find pods
      pods: [],         // list of current searched pods
      containers: [],   // optional picker for when multiple containers are in a single selected pod
      directory: null,  // selected directory
      files: [],        // selected pids filesystem tree
      isLoading: false, // flags for loading filesystem tree (may take a while...)
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

  async handlePodClick(namespace, name) {
    // @TODO: if only one container status comes back, immediately pick that PID
    const containers = await podContainers(namespace, name)
    this.setState({containers})
  }

  async handleContainerClick(id) {
    this.setState({isLoading: true})
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
    if (this.state.containers.length) {
      containersHeader = <h3>Containers</h3>
    }
		if (this.state.directory) {
			fsHeader = (
				<h2>
					Filesystem
					<small>({this.state.directory})</small>
				</h2>
			)
		}

    return (
      <Layout>
        <h1>Argus Tool</h1>

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
        <ul>
          {this.state.pods.map((pod) => (
            <li key={pod.metadata.uid}>
              <a onClick={() => this.handlePodClick(pod.metadata.namespace, pod.metadata.name)}>
                {pod.metadata.name}
              </a>
            </li>
          ))}
        </ul>

        {containersHeader}
        <ul>
          {this.state.containers.map((container) => (
            <li key={container.containerID}>
              <a onClick={() => this.handleContainerClick(container.containerID)}>
                {container.name}
              </a>
            </li>
          ))}
        </ul>

        {fsHeader}
        <FileTree directory={this.state.directory} />
      </Layout>
    )
  }
}

export default connect()(Index)
