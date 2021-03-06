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
    if (!this.state.files.length) {
      this.loadDirectory()
    }
  }

  componentDidUpdate({directory, files}) {
    const {
      directory: newDirectory,
      files: newFiles,
    } = this.props

    if ((newDirectory &&
      newDirectory !== directory) ||
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

  isIgnored(file) {
    return (this.props.subject.ignore || [])
      .indexOf(file.name) > -1
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
            maxDepth={this.props.maxDepth}
            onIgnoreClick={this.props.onIgnoreClick}
            onDirectoryClick={this.onDirectoryClick}
            onFileClick={this.onFileClick}
            isVisible={this.props.isVisible[file.path]} />
          {(file.isDirectory &&
          this.props.isVisible[file.path] &&
          !this.isIgnored(file)) &&
          <FileTree directory={file.path}
            files={file.files}
            subject={this.props.subject}
            recursive={this.props.recursive}
            maxDepth={this.props.maxDepth}
            onIgnoreClick={this.props.onIgnoreClick}
            onFileClick={this.props.onFileClick}
            toggleVisibility={this.props.toggleVisibility}
            dispatchOpenDirectory={this.props.dispatchOpenDirectory}
            openedDirectories={this.props.openedDirectories}
            isVisible={this.props.isVisible} />}
        </li>))}

        <style jsx>{`
          ul {
            margin: 1rem 0;
            padding: 0;
          }

          ul ul {
            border-left: 2px solid #d9e2ec;
            margin: 0 0 1rem 1rem;
            padding: 0.5rem 0 0 2rem;
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
        <style global jsx>{`
        .file-path i {
          margin-right: 1rem;
          vertical-align: sub;
          cursor: pointer;
        }

        .file-path .selected i.check svg polyline {
          color: #27ab83;
        }

        .file-path .disabled i {
          cursor: default;
        }

        .file-path .disabled i.check svg line,
        .file-path .ignored i.check svg line,
        .file-path .ignored i.ignore svg line {
          color: #9fb3c8;
        }

        .file-path a {
          color: #8719e0;
          font-size: 1.5rem;
          vertical-align: top;
          cursor: pointer;
        }

        .file-path a:hover {
          text-decoration: underline;
        }

        .file-path .disabled a,
        .file-path .ignored a {
          cursor: default;
        }
        .file-path .disabled a:hover,
        .file-path .ignored a:hover {
          text-decoration: none;
        }

        .file-path .disabled a {
          color: #9fb3c8;
        }

        .file-path .ignored a {
          text-decoration-line: line-through;
          text-decoration-color: #486581;
        }

        .file-path a.symlink em {
          color: #b990ff;
          font-style: normal;
          vertical-align: inherit;
        }
        `}</style>
      </ul>
    )
  }
}

export default connect(mapState, mapDispatch)(FileTree)
