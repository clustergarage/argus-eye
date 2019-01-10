import React from 'react'
import {connect} from 'react-redux'
import {
  CheckSquare,
  File,
  FileText,
  Folder,
  FolderPlus,
  FolderMinus,
  MinusCircle,
  Square,
  XCircle,
  XSquare,
} from 'react-feather'

import {mapState, mapDispatch} from '../reducers/object-config'
import {formatPath} from '../util/util'

class PathSelector extends React.Component {
  constructor(props) {
    super(props)

    this.handleCheckboxClick = this.handleCheckboxClick.bind(this)
    this.handleIgnoreClick = this.handleIgnoreClick.bind(this)
    this.onDirectoryClick = this.onDirectoryClick.bind(this)
    this.onFileClick = this.onFileClick.bind(this)
  }

  isSelected() {
    return this.isDirectlySelected() ||
      this.isRecursivelySelected()
  }

  isDirectlySelected() {
    return (this.props.subject.paths || [])
      .indexOf(formatPath(this.props.file.path)) > -1
  }

  isRecursivelySelected() {
    const path = formatPath(this.props.file.path)
    if (this.props.recursive) {
      let i = 0, len = this.props.subject.paths.length
      for (; i < len; ++i) {
        let fp = path.split('/')
        let depth = 0
        do {
          fp.pop()
          // if maxDepth is set and current recursion check exceeds it, break
          if (this.props.maxDepth &&
            ++depth > this.props.maxDepth) {
            break
          }
          if (fp.join('/') === this.props.subject.paths[i]) {
            return true
          }
        } while (fp.join('/') !== '')
      }
    }
    return false
  }

  isIgnored() {
    return (this.props.subject.ignore || [])
      .indexOf(this.props.file.name) > -1
  }

  handleCheckboxClick() {
    if (this.props.file.isDisabled ||
      // ignore if recursively selected
      this.isRecursivelySelected()) {
      return
    }
    this.props.toggleSubjectPath(this.props.subject, formatPath(this.props.file.path))
  }

  handleIgnoreClick() {
    this.props.toggleSubjectIgnore(this.props.subject, this.props.file.name)
    this.props.onIgnoreClick && this.props.onIgnoreClick(this.props.file.path)
  }

  onDirectoryClick() {
    if (this.isIgnored()) {
      return
    }
    this.props.onDirectoryClick && this.props.onDirectoryClick(this.props.file)
  }

  onFileClick() {
    this.props.onFileClick && this.props.onFileClick(this.props.file)
  }

  render() {
    const iconSize = 20
    let Icon
    if (this.props.file.isDisabled ||
      this.isIgnored()) {
      Icon = XSquare
    } else if (this.isDirectlySelected()) {
      Icon = CheckSquare
    } else if (this.isRecursivelySelected()) {
      Icon = CheckSquare
    } else {
      Icon = Square
    }
    let IgnoreIcon = this.isIgnored() ? XCircle : MinusCircle

    let classes = []
    if (this.isSelected()) {
      classes.push('selected')
    }
    if (this.isIgnored()) {
      classes.push('ignored')
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
          <a onClick={this.onDirectoryClick}>
            <i>{this.props.isVisible ? <FolderMinus size={iconSize} /> : <FolderPlus size={iconSize} />}</i>
            {this.props.file.name}
          </a>
        )
      }
      return (
        <a onClick={this.onFileClick}>
          <i>{this.props.file.isBinary ? <File size={iconSize} /> : <FileText size={iconSize} />}</i>
          {this.props.file.name}
        </a>
      )
    }

    return (
      <div className={classes.join(' ')}>
        {this.isRecursivelySelected() &&
        <i className={`ignore ${this.isIgnored() ? 'selected' : ''}`}
          onClick={this.handleIgnoreClick}>
          <IgnoreIcon size={iconSize} />
        </i>}
        <i className="check" onClick={this.handleCheckboxClick}>
          <Icon size={iconSize} />
        </i>
        {getPath()}
      </div>
    )
  }
}

export default connect(mapState, mapDispatch)(PathSelector)
