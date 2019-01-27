import React from 'react'
import Router from 'next/router'
import Moment from 'react-moment'
import {connect} from 'react-redux'
import {Check, CheckSquare, ChevronRight} from 'react-feather'

import {mapState as mapSearchState, mapDispatch as mapSearchDispatch} from '../reducers/search'
import {mapState as mapTreeState, mapDispatch as mapTreeDispatch} from '../reducers/file-tree'
import {mapState as mapConfigState, mapDispatch as mapConfigDispatch} from '../reducers/object-config'
import {mapState as mapWatchersState, mapDispatch as mapWatchersDispatch} from '../reducers/watchers'
import {
  searchPods,
  podContainers,
  containerPID,
  loadFSTree,
  deleteArgusWatcher,
} from '../lib/api'
import {formatLabels} from '../util/util'

class Watchers extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      deleteToggle: {}
    }

    this.handleEditClick = this.handleEditClick.bind(this)
    this.handleDeleteClick = this.handleDeleteClick.bind(this)
    this.handleConfirmDeleteClick = this.handleConfirmDeleteClick.bind(this)
    this.handleCancelDeleteClick = this.handleCancelDeleteClick.bind(this)
  }

  async handleEditClick(watcher, index) {
    // @TODO: better ES6 deep-copy
    watcher = JSON.parse(JSON.stringify(watcher))

    this.props.dispatchClearSearchState()
    this.props.dispatchReplaceConfigState(watcher)

    const labelSelector = formatLabels(watcher.spec.selector.matchLabels)
    this.props.dispatchSetLabelSelector(labelSelector)

    // get found pods => update state :: search with data
    const pods = await this.loadPods(labelSelector)
    let pid, cid
    if (!pods.length) {
      return
    }

    const containers = await this.selectPod(pods[0])
    if (containers.length > 1) {
      this.props.dispatchSetContainers(containers.map(container => {
        return Object.keys(container)
          .filter(key => ['containerID', 'name'].includes(key))
          .reduce((obj, key) => {
            obj[key] = container[key]
            return obj
          }, {})
      }))
    }

    let i, j, k, l
    let subject, parts, cp

    for (i = 0; i < containers.length; ++i) {
      cid = containers[i].containerID
      pid = await containerPID(cid)
      if (i === 0) {
        this.props.dispatchSelectSubject(i)
        this.props.dispatchSetRootDirectory(cid, `/proc/${pid}/root`)
      }

      for (j = 0; j < watcher.spec.subjects.length; ++j) {
        subject = watcher.spec.subjects[j]
        for (k = 0; k < subject.paths.length; ++k) {
          parts = subject.paths[k].split('/')
          parts = parts.slice(1, parts.length - 1)

          cp = `/proc/${pid}/root`
          for (l = 0; l < parts.length; ++l) {
            cp += '/' + parts[l]
            if (!this.props.isVisible[cp]) {
              this.props.toggleVisibility(cp)
            }
            if (!this.props.openedDirectories[cp]) {
              try {
                const files = await loadFSTree(cp)
                if (files.length) {
                  this.props.dispatchOpenDirectory(cp, files)
                }
              } catch(e) {
                console.error(e)
              }
            }
          }
        }
      }
    }

    this.props.dispatchSetEditing(index)
    Router.push('/')
  }

  handleDeleteClick(watcher, index) {
    this.toggleDelete(index, true)
  }

  async handleConfirmDeleteClick(watcher, index) {
    const {namespace, name} = watcher.metadata
    const response = await deleteArgusWatcher(namespace, name)
    this.props.dispatchDeleteWatcher(index)
    this.toggleDelete(index, false)
    // @TODO: if current objectConfig in state, reset
    // @TODO: add spinner, message, complete, error
  }

  handleCancelDeleteClick(index) {
    this.toggleDelete(index, false)
  }

  toggleDelete(index, value) {
    this.setState({
      deleteToggle: {
        ...this.state.deleteToggle,
        [index]: value,
      }
    })
  }

  // @TODO: store in a shared location [for pages/index | pages/watchers]
  async loadPods(selector) {
    const pods = await searchPods(selector)
    this.props.dispatchSetPods(pods.map(pod => ({
      metadata: Object.keys(pod.metadata)
        .filter(key => ['uid', 'namespace', 'name'].includes(key))
        .reduce((obj, key) => {
          obj[key] = pod.metadata[key]
          return obj
        }, {})
    })))
    return pods
  }

  async selectPod(pod) {
    const {namespace, name} = pod.metadata
    const containers = await podContainers(namespace, name)
    return containers
  }

  render() {
    const getRowClass = index => {
      let classes = []
      if (this.props.editing === index) {
        classes.push('editing')
      }
      if (this.state.deleteToggle[index]) {
        classes.push('toggled')
      }
      return classes.join(' ')
    }

    return (
      <div className="container">
        <div className="row">
          <div className="column">
            <table>
              <thead>
                <tr>
                  <th>&nbsp;</th>
                  <th>namespace / watcher</th>
                  <th>selector</th>
                  <th>subjects</th>
                  <th>created</th>
                </tr>
              </thead>
              <tbody>
                {this.props.watchers.map((watcher, index) => (
                <React.Fragment key={watcher.metadata.uid}>
                  <tr key={watcher.metadata.uid}
                    className={getRowClass(index)}>
                    <td className="buttons">
                      <button type="button"
                        disabled={this.props.editing === index}
                        className="button button-small"
                        onClick={() => this.handleEditClick(watcher, index)}>
                        {this.props.editing === index ? 'editing' : 'edit'}
                      </button>
                      <button type="button"
                        className="button button-small"
                        onClick={() => this.handleDeleteClick(watcher, index)}>
                        delete
                      </button>
                    </td>
                    <td>
                      {watcher.metadata.namespace} /&nbsp;
                      <a>{watcher.metadata.name}</a>
                    </td>
                    <td className="selector">
                      <small>
                        {Object.keys(watcher.spec.selector.matchLabels).map((key, index) => (
                        <div key={index}>
                          <em>{key}={watcher.spec.selector.matchLabels[key]}</em>
                        </div>
                        ))}
                      </small>
                    </td>
                    <td className="subjects">
                      {watcher.spec.subjects.map((subject, index) => (
                      <div key={index} className="subject">
                        <label>
                          <b>paths</b>
                          <div>
                            <small>
                              {subject.paths.map((path, idx) => (
                              <span key={idx}>
                                <em>{path}</em><br />
                              </span>
                              ))}
                            </small>
                          </div>
                        </label>

                        <label>
                          <b>events</b>
                          <div>
                            <small>
                              {subject.events.map((event, idx) => (
                              <span key={idx}>
                                <em>{event}</em>&nbsp;
                              </span>
                              ))}
                            </small>
                          </div>
                        </label>

                        {subject.recursive &&
                        <label className="option">
                          <i><CheckSquare size={18} /></i>
                          <b>recursive</b>&nbsp;
                          {subject.maxDepth &&
                          <small>
                            (max depth: <em>{subject.maxDepth}</em>)
                          </small>}
                          {(subject.ignore && subject.ignore.length > 0) &&
                          <label className="ignore">
                            <b>ignored</b>
                            <div>
                              <small>
                                {subject.ignore.map((ignore, idx) => (
                                <span key={idx}>
                                  <em>{ignore}</em><br />
                                </span>
                                ))}
                              </small>
                            </div>
                          </label>}
                        </label>}

                        {subject.onlyDir &&
                        <label className="option">
                          <i><CheckSquare size={18} /></i>
                          <b>only directories</b>
                        </label>}

                        {subject.followMove &&
                        <label className="option">
                          <i><CheckSquare size={18} /></i>
                          <b>follow move events</b>
                        </label>}

                        {subject.tags &&
                        <label>
                          <b>tags</b>
                          <div>
                            <small>
                              <em>{formatLabels(subject.tags)}</em>
                            </small>
                          </div>
                        </label>}
                      </div>
                      ))}
                    </td>
                    <td className="created">
                      <Moment format="MM/DD/YYYY HH:mm:ss">
                        {watcher.metadata.creationTimestamp}
                      </Moment>
                    </td>
                  </tr>
                  <tr className={`overlay ${this.state.deleteToggle[index] ? 'toggled' : ''}`}>
                    <td colSpan="5">
                      <div className="wrapper">
                        <h5>
                          Delete <b>{watcher.metadata.namespace} /&nbsp;
                          <a>{watcher.metadata.name}</a></b>?
                        </h5>
                        Doing so will permanently remove the watcher from your cluster.
                        <div className="buttons">
                          <button type="button"
                            className="button button-small"
                            onClick={() => this.handleConfirmDeleteClick(watcher, index)}>
                            Delete
                          </button>
                          <button type="button"
                            className="button button-small button-outline"
                            onClick={() => this.handleCancelDeleteClick(index)}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>))}
              </tbody>
            </table>
          </div>
        </div>

        <style jsx>{`
        table tr {
          visibility: visible;
        }

        table tr.toggled {
          visibility: collapse;
        }

        table tr.overlay {
          visibility: collapse;
          opacity: 0;
          transition: opacity 1s ease-out;
        }

        table tr.overlay.toggled {
          visibility: visible;
          opacity: 1;
        }

        table tr.overlay td .wrapper {
          max-height: 0;
          overflow: hidden;
          transition: max-height 1s ease-out;
        }

        table tr.overlay.toggled td .wrapper {
          height: auto;
          max-height: 500px;
        }

        table tr.overlay td {
          text-align: center;
        }

        table tr.overlay td h5 {
          margin-bottom: 1rem;
        }

        table th,
        table td {
          font-size: 1.4rem;
        }

        table td {
          line-height: 2rem;
          vertical-align: top;
        }

        table td.buttons,
        table td.subjects,
        table td.created {
          white-space: nowrap;
        }

        table td.buttons .button,
        table tr.overlay .buttons .button {
          margin-right: 0.5rem;
        }

        table tr.overlay .buttons {
          margin-top: 1.5rem;
        }

        table td.subjects {
          width: 33%;
        }

        table td.selector small em {
          background-color: #c1fef6;
        }

        table td.subjects .subject {
          border-bottom: 2px solid #d9e2ec;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
        }

        table td.subjects .subject:last-child {
          border-bottom: 0;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        table td label {
          font-size: 1.4rem;
          margin-bottom: 1rem;
        }

        table td label.option {
          margin-bottom: 0.5rem;
        }

        table td label.ignore {
          margin: 0.25rem 0 1rem 2.6rem;
        }

        table td label i {
          vertical-align: sub;
          vertical-align: -webkit-baseline-middle;
          margin-right: 0.75rem;
        }

        table td small em {
          color: #000;
          font-family: 'Ubuntu Mono', monospace;
          background-color: #c6f7e2;
          font-style: normal;
          padding: 0.1rem 0.2rem;
        }
        `}</style>
        <style global jsx>{`
        table td label.option i svg polyline {
          color: #27ab83;
        }
        `}</style>
      </div>
    )
  }
}

const mapState = state => (Object.assign({},
  mapSearchState(state),
  mapTreeState(state),
  mapConfigState(state),
  mapWatchersState(state)))

const mapDispatch = dispatch => (Object.assign({},
  mapSearchDispatch(dispatch),
  mapTreeDispatch(dispatch),
  mapConfigDispatch(dispatch),
  mapWatchersDispatch(dispatch)))

export default connect(mapState, mapDispatch)(Watchers)
