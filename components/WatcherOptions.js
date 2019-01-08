import React from 'react'
import {connect} from 'react-redux'
import {CornerDownRight, Plus, Minus} from 'react-feather'

import {mapState, mapDispatch} from '../reducers/object-config'

class WatcherOptions extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      events: this.props.events || [],
      recursive: this.props.subjects[this.props.subject] && this.props.subjects[this.props.subject].recursive || false,
    }

    this.handleEventChange = this.handleEventChange.bind(this)
    this.handleRecursiveChange = this.handleRecursiveChange.bind(this)
  }

  handleEventChange(event) {
  }

  handleRecursiveChange(event) {
    this.setState({recursive: !this.state.recursive})
    this.props.toggleRecursive(this.props.subject)
  }

  render() {
    const events = [
      'access',
      'attrib',
      'closewrite', 'closenowrite', 'close',
      'create',
      'delete', 'deleteself',
      'modify',
      'moveself', 'movedfrom', 'movedto', 'move',
      'open',
      'all'
    ]

    const getSelectedPaths = () => {
      return this.props.subjects[this.props.subject] &&
        this.props.subjects[this.props.subject].paths || []
    }

    const getIgnoredPaths = () => {
      return this.props.subjects[this.props.subject] &&
        this.props.subjects[this.props.subject].ignore || []
    }

    return (
      <div>
        <form>
          <label className="events">
            Events<br />
            <div>
            {events.map(event => (
              <span key={event}>
                <button type="button"
                  className={`button button-small ${this.state.events.indexOf(event) === -1 ? 'button-outline' : ''}`}
                  onClick={this.handleEventChange}>
                  {event}{['close', 'move', 'all'].indexOf(event) > -1 ? ' *' : ''}
                </button>
                <input type="hidden"
                  value={this.state.events} />
              </span>
            ))}
            </div>
            <small><em>*</em> denotes a combined event</small>
          </label>

          <label>
            Paths&nbsp;
            <small>(<em>{getSelectedPaths().length}</em> selected)</small>
            {getSelectedPaths().length > 0 &&
            <ul className="paths">
              {getSelectedPaths().map((path, index) => (
                <li key={index}>
                  <i><Plus size="14" /></i>
                  {path}
                </li>
              ))}
            </ul>}
          </label>

          <label>
            <input type="checkbox"
              checked={this.state.recursive}
              onChange={this.handleRecursiveChange} />
            Recursive
            {this.state.recursive && (
              <div className="recursive">
                <label>
                  Ignored paths&nbsp;
                  <small>(<em>{getIgnoredPaths().length}</em> selected)</small>
                  {getIgnoredPaths().length > 0 &&
                  <ul className="ignored">
                    {getIgnoredPaths().map((path, index) => (
                      <li key={index}>
                        <i><Minus size="14" /></i>
                        {path}
                      </li>
                    ))}
                  </ul>}
                </label>

                <label>
                  Max depth
                  <input type="text"
                    value={this.state.maxDepth}
                    onChange={this.handleMaxDepthChange} />
                </label>
              </div>
            )}
          </label>

          <label>
            <input type="checkbox"
              value={this.state.onlyDir}
              onChange={this.handleOnlyDirChange} />
            Only directories
          </label>

          <label>
            <input type="checkbox"
              value={this.state.followMove}
              onChange={this.handleFollowMoveChange} />
            Follow move events
          </label>

          <label>
            Custom tags&nbsp;
            <small>(comma-separated <em>key=value</em> pairs)</small><br />
            <small>(e.g. <em>app=foo,env=dev</em>)</small>
            <input type="text"
              value={this.state.tags}
              onChange={this.handleTagsChange} />
          </label>
        </form>

        <style jsx>{`
        label small {
          font: 1.2rem 'Ubuntu Mono', monospace;
        }

        label em {
          color: #000;
          background-color: #c6f7e2;
          font-style: normal;
          padding: 0.1rem 0.2rem;
        }

        .button {
          margin: 0 0.5rem 0.5rem 0;
        }

        .button.button-small {
          height: 2.8rem;
          font-size: 0.8rem;
          line-height: 2.8rem;
          padding: 0 1.5rem;
        }

        .events {
          margin-bottom: 2rem;
        }

        ul.paths,
        ul.ignored {
          margin: 1rem 0 2rem;
        }

        ul.paths li,
        ul.ignored li {
          list-style: none;
          font: 1.2rem "Ubuntu Mono", monospace;
        }

        ul.paths li i,
        ul.ignored li i {
          margin-right: 0.5rem;
          vertical-align: sub;
        }

        .recursive {
          padding: 0.5rem 0 0.5rem 3rem;
        }
        `}</style>
      </div>
    )
  }
}

export default connect(mapState, mapDispatch)(WatcherOptions)
