import React from 'react'
import Moment from 'react-moment'
import {connect} from 'react-redux'
import {Check, CheckSquare, ChevronRight} from 'react-feather'

import {mapState, mapDispatch} from '../reducers/watchers'
import {formatLabels} from '../util/util'

class Watchers extends React.Component {
  render() {
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
                {this.props.watchers.map(watcher => (
                <tr key={watcher.metadata.uid}>
                  <td className="buttons">
                    <button type="button" className="button button-small">edit</button>
                    <button type="button" className="button button-small">delete</button>
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
                </tr>))}
              </tbody>
            </table>
          </div>
        </div>

        <style jsx>{`
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

        table td.buttons .button {
          margin-right: 0.5rem;
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

export default connect(mapState, mapDispatch)(Watchers)
