import React from 'react'
import {connect} from 'react-redux'

import PathSelector from '../components/PathSelector'
import {mapState, mapDispatch} from '../reducers/file-tree'
import {loadFSTree} from '../lib/api'

class FileTree extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      files: this.props.files || [],
    }

    this.onDirectoryClick = this.onDirectoryClick.bind(this)
    this.onFileClick = this.onFileClick.bind(this)
  }

  componentDidMount() {
    this.state.files.length || this.loadDirectory()
  }

  componentDidUpdate({directory, files}) {
    const {
      directory: newDirectory,
      files: newFiles,
    } = this.props

    if ((newDirectory && newDirectory !== directory) ||
      (newFiles && newFiles !== files)) {
      this.loadDirectory()
    }
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

  async onDirectoryClick(file) {
    this.props.toggleVisibility(file.path)
    if ((this.props.openedDirectories &&
      !this.props.openedDirectories[file.path]) ||
      this.props.isVisible[file.path]) {
      file.files = await loadFSTree(file.path)
      this.props.dispatchOpenDirectory(file.path, file.files)
    }
  }

  onFileClick(file) {
    this.props.onFileClick && this.props.onFileClick(file)
  }

  render() {
    return (
      this.state.files.length > 0 &&
      <ul>
        {this.state.files.map(file => (
          <li key={file.path} className="file-path">
            <PathSelector file={file}
              subject={this.props.subject}
              recursive={this.props.recursive}
              onDirectoryClick={this.onDirectoryClick}
              onFileClick={this.onFileClick}
              isVisible={this.props.isVisible[file.path]} />
            {(file.isDirectory && this.props.isVisible[file.path]) &&
              <FileTree directory={file.path}
                files={file.files}
                subject={this.props.subject}
                recursive={this.props.recursive}
                onFileClick={this.props.onFileClick}
                toggleVisibility={this.props.toggleVisibility}
                dispatchOpenDirectory={this.props.dispatchOpenDirectory}
                openedDirectories={this.props.openedDirectories}
                isVisible={this.props.isVisible} />}
          </li>
        ))}

        <style jsx>{`
          ul {
            margin: 1rem 0;
            padding: 0;
          }

          ul ul {
            border-left: 1px dotted #ddd;
            margin: 0 0 0 1rem;
            padding: 0.5rem 0 0.5rem 2rem;
          }

          li {
            font-family: 'Ubuntu Mono', monospace;
            list-style: none;
            margin: 0;
          }

          li a {
            font-size: 1.5rem;
            vertical-align: top;
            cursor: pointer;
          }

          li a.symlink em {
            color: #627d98;
            font-style: normal;
            vertical-align: inherit;
          }
        `}</style>
      </ul>
    )
  }
}

export default connect(mapState, mapDispatch)(FileTree)
