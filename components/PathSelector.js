import React from 'react'
import {connect} from 'react-redux'
import {
  File,
  FileText,
  Folder,
  FolderPlus,
  FolderMinus,
  Square,
  CheckSquare,
  XSquare,
} from 'react-feather'

import {mapState, mapDispatch} from '../reducers/object-config'
import {formatPath} from '../util/util'

class PathSelector extends React.Component {
  constructor(props) {
    super(props)

    this.handleCheckboxClick = this.handleCheckboxClick.bind(this)
  }

  checkIsSelected() {
    const path = formatPath(this.props.file.path)
    // check if path is directly in subject paths list
    if ((this.props.subject.paths || []).indexOf(path) > -1) {
      return true
    }
    // check if parent directory is in subject paths list and recursive=true
    if (this.props.recursive) {
      let i = 0, len = this.props.subject.paths.length
      for (; i < len; ++i) {
        let fp = path.split('/')
        do {
          fp.pop()
          if (fp.join('/') === this.props.subject.paths[i]) {
            return true
          }
        } while (fp.join('/') !== '')
      }
    }
    return false
  }

  handleCheckboxClick() {
    if (this.props.file.isDisabled) {
      return
    }
    this.props.toggleSubjectPath(this.props.subject, formatPath(this.props.file.path))
  }

  render() {
    const iconSize = 20
    const Icon = this.props.file.isDisabled ? XSquare
      : (this.checkIsSelected() ? CheckSquare : Square)

    let classes = []
    if (this.checkIsSelected()) {
      classes.push('selected')
    }
    if (this.props.file.isDisabled) {
      classes.push('disabled')
    } else if (this.props.file.isSymlink) {
      //classes.push('...')
    }

    let getPath = () => {
      if (this.props.file.isDisabled) {
        return (
          <a>
            <i>{this.props.file.isDirectory ? <Folder size={iconSize} /> :
              (this.props.file.isBinary ? <File size={iconSize} /> : <FileText size={iconSize} />)}</i>
            {this.props.file.name}
          </a>
        )
      } else if (this.props.file.isSymlink) {
        return (
          <a className="symlink">
            <i><Folder size={iconSize} /></i>
            {this.props.file.name} <em>-> {this.props.file.targetPath}</em>
          </a>
        )
      } else if (this.props.file.isDirectory) {
        return (
          <a onClick={() => this.props.onDirectoryClick && this.props.onDirectoryClick(this.props.file)}>
            <i>{this.props.isVisible ? <FolderMinus size={iconSize} /> : <FolderPlus size={iconSize} />}</i>
            {this.props.file.name}
          </a>
        )
      }
      return (
        <a onClick={() => this.props.onFileClick && this.props.onFileClick(this.props.file)}>
          <i>{this.props.file.isBinary ? <File size={iconSize} /> : <FileText size={iconSize} />}</i>
          {this.props.file.name}
        </a>
      )
    }

    return (
      <div className={classes.join(' ')}>
        <i className="check" onClick={this.handleCheckboxClick}>
          <Icon size={iconSize} />
        </i>
        {getPath()}
      </div>
    )
  }
}

export default connect(mapState, mapDispatch)(PathSelector)
