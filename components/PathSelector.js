import React from 'react'
import {connect, Provider} from 'react-redux'
import {Square, CheckSquare, XSquare} from 'react-feather'

import {mapState, mapDispatch} from '../reducers/object-config'
//import {loadFSTree} from '../lib/api'

class PathSelector extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      //file: this.props.file || {},
    }

    this.handleCheckboxClick = this.handleCheckboxClick.bind(this)
  }

  async handleCheckboxClick() {
  }

  render() {
    const iconSize = 20

    let selector
    if (this.props.file.isDisabled) {
      return <i className="disabled"><XSquare size={iconSize} /></i>
    } else if (this.props.file.isSymlink) {
      return <i className="disabled"><Square size={iconSize} /></i>
    } else if (this.props.file.isDirectory) {
      return <i><Square size={iconSize} /></i>
    }
    return <i><Square size={iconSize} /></i>
  }
}

export default connect(mapState, mapDispatch)(PathSelector)
