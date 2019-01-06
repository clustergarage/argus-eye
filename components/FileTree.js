import React from 'react'
import {connect, Provider} from 'react-redux'
import {
  ChevronDown,
  ChevronRight,
  File,
  FileText,
  Folder,
  FolderPlus,
  FolderMinus,
  Square,
  CheckSquare,
  XSquare,
} from 'react-feather'

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

  async handleDirectoryClick(file) {
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
    const iconSize = 20

    return (
      this.state.files.length > 0 &&
      <ul>
        {this.state.files.map(file => {
          if (!file.isWatchable) {
            return (
              <li key={file.path}>
                <i><XSquare size={iconSize} /></i>
                <a>
                  <i>{file.isDir ? <Folder size={iconSize} /> : (file.isBinary ? <File size={iconSize} /> : <FileText size={iconSize} />)}</i>
                  {file.name}
                </a>
              </li>
            )
          } else if (file.isSymlink) {
            return (
              <li key={file.path}>
                <i><Square size={iconSize} /></i>
                <a>
                  <i><Folder size={iconSize} /></i>
                  {file.name} -&gt; {file.targetPath}
                </a>
              </li>
            )
          } else if (file.isDir) {
            return (
              <li key={file.path}>
                <i><Square size={iconSize} /></i>
                <a onClick={() => this.handleDirectoryClick(file)}>
                  <i>{this.props.isVisible[file.path] ? <FolderMinus size={iconSize} /> : <FolderPlus size={iconSize} />}</i>
                  {file.name}
                </a>
                {this.props.isVisible[file.path] &&
                  <FileTree directory={file.path}
                    files={file.files}
                    onFileClick={this.props.onFileClick}
                    toggleVisibility={this.props.toggleVisibility}
                    dispatchOpenDirectory={this.props.dispatchOpenDirectory}
                    openedDirectories={this.props.openedDirectories}
                    isVisible={this.props.isVisible} />}
              </li>
            )
          } else {
            return (
              <li key={file.path}>
                <i><Square size={iconSize} /></i>
                <a onClick={() => this.onFileClick(file)}>
                  <i>{file.isBinary ? <File size={iconSize} /> : <FileText size={iconSize} />}</i>
                  {file.name}
                </a>
              </li>
            )
          }
        })}

        <style jsx>{`
          ul {
            margin: 1rem 0;
            padding: 0;
          }

          ul ul {
            border-left: 1px dotted #ddd;
            margin: 0 0 0 1rem;
            padding: 0 0 0 3rem;
          }

          li {
            list-style: none;
            margin: 0.5rem 0;
          }

          li i {
            margin-right: 1rem;
            cursor: pointer;
          }

          li a {
            font-size: 1.5rem;
            vertical-align: top;
            cursor: pointer;
          }
        `}</style>
      </ul>
    )
  }
}

export default connect(mapState, mapDispatch)(FileTree)
