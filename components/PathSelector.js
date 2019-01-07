import React from 'react'
import {connect} from 'react-redux'
import {Square, CheckSquare, XSquare} from 'react-feather'

import {mapState, mapDispatch} from '../reducers/object-config'
import {formatPath} from '../util/util'

class PathSelector extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      index: this.props.index,
      isSelected: this.checkIsSelected(),
    }

    this.handleCheckboxClick = this.handleCheckboxClick.bind(this)
  }

  componentDidUpdate({index}) {
    if (this.props.index && this.props.index !== index) {
      this.setState({isSelected: this.checkIsSelected()})
    }
  }

  checkIsSelected() {
    return (this.props.subjects[this.props.index] &&
      this.props.subjects[this.props.index].paths || [])
        .indexOf(formatPath(this.props.file.path)) > -1;
  }

  handleCheckboxClick() {
    if (this.props.file.isDisabled) {
      return
    }
    this.props.toggleSubjectPath(this.props.index, formatPath(this.props.file.path))
    this.setState({isSelected: !this.state.isSelected})
  }

  render() {
    const Icon = this.props.file.isDisabled ? XSquare
      : (this.state.isSelected ? CheckSquare : Square)
    let classes = []
    if (this.state.isSelected) {
      classes.push('selected')
    }
    if (this.props.file.isDisabled ||
      this.props.file.isSymlink) {
      classes.push('disabled')
    }

    return (
      <i onClick={this.handleCheckboxClick}
        className={classes.join(' ')}>
        <Icon size="20" />
      </i>
    )
  }
}

export default connect(mapState, mapDispatch)(PathSelector)
