import React from 'react'
import {connect, Provider} from 'react-redux'

import {
	toggleVisibility,
	openDirectory,
	mapState,
	mapDispatch,
} from '../reducers/file-tree'
import {loadFSTree} from '../lib/api'

class FileTree extends React.Component {
  constructor(props) {
    super(props)
    this.state = {files: this.props.files || []}

    this.handleDirectoryClick = this.handleDirectoryClick.bind(this)
    this.onFileClick = this.onFileClick.bind(this)
  }

	async loadDirectory() {
    if (this.props.openedDirectories &&
      this.props.openedDirectories[this.props.directory]) {
      this.setState({files: this.props.openedDirectories[this.props.directory]})
    } else if (this.props.directory) {
			const files = await loadFSTree(this.props.directory)
			this.setState({files})
    }
	}

	componentDidMount() {
		this.loadDirectory()
	}

  componentDidUpdate({directory}) {
		if (this.props.directory !== directory) {
			this.loadDirectory()
		}
  }

  async handleDirectoryClick(file) {
    this.props.toggleVisibility(file.path)
    if ((this.props.openedDirectories &&
      !this.props.openedDirectories[file.path]) ||
      this.props.isVisible[file.path]) {

      const files = await loadFSTree(file.path)
			this.props.dispatchOpenDirectory(file.path, files)
    }
  }

  onFileClick(file) {
    this.props.onFileClick && this.props.onFileClick(file)
  }

  render() {
    return (
      this.state.files.length > 0 &&
      <ul>
        {this.state.files.map(file => {
          return file.isDir ?
            <li key={file.path}>
              <div onClick={() => this.handleDirectoryClick(file)}>{file.name}</div>
              {this.props.isVisible[file.path] &&
                <FileTree directory={file.path}
                  files={file.files}
                  onFileClick={this.props.onFileClick}
                  toggleVisibility={this.props.toggleVisibility}
                  dispatchOpenDirectory={this.props.dispatchOpenDirectory}
                  openedDirectories={this.props.openedDirectories}
                  isVisible={this.props.isVisible} />}
            </li>
          :
						<li key={file.path}>
						  <div onClick={() => this.onFileClick(file)}>{file.name}</div>
						</li>
        })}
      </ul>
    )
  }
}

export default connect(mapState, mapDispatch)(FileTree)
