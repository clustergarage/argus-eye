import React from 'react'
import {connect} from 'react-redux'
import {
  Activity,
  ChevronDown,
  ChevronRight,
  CornerDownRight,
  Info,
  Plus,
  Minus,
} from 'react-feather'

import {mapState, mapDispatch} from '../reducers/object-config'
import {formatLabels, tagsToObject} from '../util/util'

class WatcherOptions extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      tags: formatLabels(this.props.subject.tags || {}),
      logFormat: this.props.spec.logFormat || '',
      showSpecifiers: false,
    }

    this.handleEventChange = this.handleEventChange.bind(this)
    this.handleRecursiveChange = this.handleRecursiveChange.bind(this)
    this.handleMaxDepthChange = this.handleMaxDepthChange.bind(this)
    this.handleOnlyDirChange = this.handleOnlyDirChange.bind(this)
    this.handleFollowMoveChange = this.handleFollowMoveChange.bind(this)
    this.handleTagsChange = this.handleTagsChange.bind(this)
    this.handleLogFormatChange = this.handleLogFormatChange.bind(this)
    this.toggleSpecifiers = this.toggleSpecifiers.bind(this)
    this.insertSpecifier = this.insertSpecifier.bind(this)
  }

  handleEventChange(event) {
    this.props.toggleEvent(this.props.subject, event)
  }

  handleRecursiveChange(event) {
    this.props.onRecursiveChange && this.props.onRecursiveChange(this.props.subject)
  }

  handleMaxDepthChange(event) {
    this.props.onMaxDepthChange && this.props.onMaxDepthChange(this.props.subject, event.target.value)
  }

  handleOnlyDirChange() {
    this.props.onOnlyDirChange && this.props.onOnlyDirChange(this.props.subject)
  }

  handleFollowMoveChange() {
    this.props.onFollowMoveChange && this.props.onFollowMoveChange(this.props.subject)
  }

  handleTagsChange(event) {
    const oldTags = tagsToObject(this.state.tags)
    const newTags = tagsToObject(event.target.value)
    this.setState({tags: event.target.value})
    if (JSON.stringify(oldTags) !== JSON.stringify(newTags)) {
      this.props.dispatchSetTags(this.props.subject, newTags)
    }

    this.props.onTagsChange && this.props.onTagsChange(event.target.value)
  }

  handleLogFormatChange(event) {
    this.setState({logFormat: event.target.value})
    this.props.dispatchSetLogFormat(event.target.value)
  }

  toggleSpecifiers() {
    this.setState({showSpecifiers: !this.state.showSpecifiers})
  }

  insertSpecifier(specifier) {
    const selection = this.logFormatInput.selectionStart
    const value = this.state.logFormat.slice(0, selection) +
      `{${specifier.name}}` +
      this.state.logFormat.slice(this.logFormatInput.selectionEnd)
    this.setState({logFormat: value}, () => {
      const newSelection = selection + specifier.name.length + 2
      this.logFormatInput.selectionStart = this.logFormatInput.selectionEnd = newSelection
      this.props.dispatchSetLogFormat(value)
    })
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
      'all',
    ]
    const specifiers = [
      { name: 'pod', description: 'name of the pod' },
      { name: 'node', description: 'name of the node' },
      { name: 'event', description: 'inotify event that was observed' },
      { name: 'path', description: 'name of the directory path' },
      { name: 'file', description: 'name of the file' },
      { name: 'ftype', description: 'evaluates to "file" or "directory"' },
      { name: 'tags', description: 'list of custom tags in key=value comma-separated list' },
      { name: 'sep', description: 'placeholder for a "/" character to include (e.g. between the path/file specifiers)' },
    ]

    const getSelectedPaths = () => {
      return this.props.subject.paths || []
    }

    const getIgnoredPaths = () => {
      return this.props.subject.ignore || []
    }

    const iconSize = 14

    const defaultLogFormat = `{event} {ftype} '{path}{sep}{file}' ({pod}:{node}) {tags}`
    const formatLiveExample = () => {
      const format = require('string-format')
      const example = {
        pod: 'foo-1-pod',
        node: 'barnode',
        event: 'MODIFY',
        path: '/path/to',
        file: 'file.ext',
        ftype: 'file',
        tags: 'foo=bar',
        sep: '\/',
      }
      return format(this.state.logFormat || defaultLogFormat, example)
    }

    return (
      <div>
        <form>
          <label>
            Events&nbsp;
            <small>(required)</small><br />
            <small>(<em>*</em> denotes a combined event)</small>
          </label>
          <div className="events">
            {events.map(event => (
            <span key={event}>
              <button type="button"
                className={`button button-small ${this.props.subject.events.indexOf(event) === -1 ? 'button-outline' : ''}`}
                onClick={() => this.handleEventChange(event)}>
                {event}{['close', 'move', 'all'].indexOf(event) > -1 ? ' *' : ''}
              </button>
            </span>))}
          </div>

          <label>
            Paths&nbsp;
            <small>(required)</small>&nbsp;
            <small>(<em>{getSelectedPaths().length}</em> selected)</small>
            {getSelectedPaths().length > 0 &&
            <ul className="paths">
              {getSelectedPaths().sort().map((path, index) => (
              <li key={index}>
                <i><Plus size={iconSize} /></i>
                {path}
              </li>))}
            </ul>}
          </label>

          <label>
            <input type="checkbox"
              checked={this.props.recursive}
              onChange={this.handleRecursiveChange} />
            Recursive
            {this.props.recursive && (
            <div className="recursive">
              <label>
                Ignored paths&nbsp;
                <small>(<em>{getIgnoredPaths().length}</em> selected)</small>
                {getIgnoredPaths().length > 0 &&
                <ul className="ignored">
                  {getIgnoredPaths().sort().map((path, index) => (
                  <li key={index}>
                    <i><Minus size={iconSize} /></i>
                    {path}
                  </li>))}
                </ul>}
              </label>

              <label>
                Max depth
                <input type="number"
                  value={this.props.maxDepth}
                  onChange={this.handleMaxDepthChange} />
              </label>
            </div>)}
          </label>

          <label>
            <input type="checkbox"
              checked={this.props.onlyDir}
              onChange={this.handleOnlyDirChange} />
            Only directories
          </label>

          <label>
            <input type="checkbox"
              checked={this.props.followMove}
              onChange={this.handleFollowMoveChange} />
            Follow move events
          </label>

          <label>
            Custom tags&nbsp;
            <small>(comma-separated <em>key=value</em> pairs)</small><br />
            <input type="text"
              value={this.state.tags}
              onChange={this.handleTagsChange}
              placeholder="app=foo,env=dev" />
          </label>

          <label className="log-format">
            Custom log format<br />
            <input type="text"
              value={this.state.logFormat}
              ref={input => this.logFormatInput = input}
              onChange={this.handleLogFormatChange}
              placeholder={defaultLogFormat} />
            <div className="live-example">
              <small>
                <div>
                  <i><Activity size={iconSize} /></i>
                  live example:
                </div>
                <em>{formatLiveExample()}</em>
              </small>
            </div>
            <div className="specifiers">
              <small>
                <a onClick={this.toggleSpecifiers}>
                  <i>{this.state.showSpecifiers ? <ChevronDown size={iconSize} /> : <ChevronRight size={iconSize} />}</i>
                  show possible specifiers
                </a>
                {this.state.showSpecifiers &&
                <div>
                  <div className="help">
                    <i><Info size={iconSize} /></i>
                    click specifier <em>name</em> to add it to custom log format
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>name</th>
                        <th>description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {specifiers.map(specifier => (
                      <tr key={specifier.name}>
                        <td>
                          <a onClick={() => this.insertSpecifier(specifier)}>
                            {specifier.name}
                          </a>
                        </td>
                        <td>{specifier.description}</td>
                      </tr>))}
                    </tbody>
                  </table>
                </div>}
              </small>
            </div>
          </label>
        </form>

        <style jsx>{`
        .button {
          margin: 0 0.5rem 0.5rem 0;
        }

        .events {
          margin-bottom: 2rem;
        }

        ul.paths {
          margin: 1rem 0 2rem;
        }

        ul.ignored {
          margin: 1rem 0;
        }

        ul.paths li,
        ul.ignored li {
          list-style: none;
          font: 1.2rem "Ubuntu Mono", monospace;
          overflow-wrap: break-word;
        }

        ul.paths li i,
        ul.ignored li i {
          margin-right: 0.5rem;
          vertical-align: sub;
          vertical-align: -webkit-baseline-middle;
        }

        .recursive {
          padding: 0.5rem 0 0.5rem 3rem;
        }

        .log-format {
          border-top: 2px solid #d9e2ec;
          margin-top: 1.5rem;
          padding-top: 2rem;
        }

        .log-format .live-example em {
          display: inline-block;
          line-height: 1.6rem;
          word-break: break-all;
          margin: 1rem 0;
        }

        .log-format .specifiers {
          margin-top: 0.5rem;
        }

        .log-format .specifiers .help {
          margin: 1rem 0 0.5rem;
        }

        .log-format .specifiers a {
          cursor: pointer;
        }

        .log-format .specifiers table {
          margin-bottom: 1.5rem;
        }

        .log-format .live-example i,
        .log-format .specifiers i {
          vertical-align: sub;
          vertical-align: -webkit-baseline-middle;
          margin-right: 0.5rem;
        }
        `}</style>
      </div>
    )
  }
}

export default connect(mapState, mapDispatch)(WatcherOptions)
