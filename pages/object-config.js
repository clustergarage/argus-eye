import React from 'react'
import {connect} from 'react-redux'
import {Copy} from 'react-feather'

import Layout from '../components/Layout'
import {json2yaml} from '../lib/json2yaml'

class ObjectConfig extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const json = (this.props.objectConfig || {})
    Object.keys(json).forEach(key => json[key] === null && delete json[key])
    const yaml = json2yaml(json)

    return (
      <Layout>
        <div className="container">
          <div className="row">
            <div className="column">
              <h3>YAML</h3>
              <pre>
                <div className="copy">
                  <i><Copy size={18} /></i>
                </div>
                {yaml}
              </pre>
            </div>
            <div className="column">
              <h3>JSON</h3>
              <pre>
                <div className="copy">
                  <i><Copy size={18} /></i>
                </div>
                {JSON.stringify(json, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        <style jsx>{`
        pre {
          position: relative;
          padding: 2rem;
        }

        pre .copy {
          position: absolute;
          top: 0.6rem;
          right: 0.75rem;
        }

        pre .copy i {
          color: #a368fc;
          cursor: pointer;
        }

        pre .copy:hover i {
          color: #7a0ecc;
        }
        `}</style>
      </Layout>
    )
  }
}

export const mapState = state => ({
  objectConfig: state.objectConfig,
})

export default connect(mapState)(ObjectConfig)
