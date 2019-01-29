import App, {Container} from 'next/app'
import React from 'react'
import {Provider} from 'react-redux'
import {PersistGate} from 'redux-persist/integration/react'
import withRedux from 'next-redux-wrapper'

import Layout from '../components/Layout'
import persistedStore from '../store/store'
import {mapDispatch} from '../reducers/watchers'
import {listArgusWatchers} from '../lib/api'

class ArgusTool extends App {
  static async getInitialProps({Component, ctx}) {
    const pageProps = Component.getInitialProps ? await Component.getInitialProps(ctx) : {}
    return {pageProps}
  }

  async componentDidMount() {
    // only load on server-side
    if (this.props.isServer) {
      // get list of watchers and store
      const watchers = await listArgusWatchers()
      const dispatch = mapDispatch(this.props.store.dispatch)
      dispatch.dispatchSetWatchers(watchers)
    }
  }

  render() {
    const {Component, pageProps, store} = this.props
    return (
      <Container>
        <Provider store={store}>
          <PersistGate persistor={store.persistor}
            loading={<div>Loading...</div>}>
            <Layout {...pageProps}>
              <Component {...pageProps} />
            </Layout>
          </PersistGate>
        </Provider>
      </Container>
    )
  }
}

export default withRedux(persistedStore)(ArgusTool)
//export default ArgusTool
