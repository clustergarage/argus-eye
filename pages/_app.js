import App, {Container} from 'next/app'
import React from 'react'
import {Provider} from 'react-redux'
import withRedux from 'next-redux-wrapper'

import Layout from '../components/Layout'
import {initializeStore} from '../store/store'
import {mapDispatch} from '../reducers/watchers'
import {listArgusWatchers} from '../lib/api'

class ArgusTool extends App {
  static async getInitialProps({Component, ctx}) {
    const dispatch = mapDispatch(ctx.store.dispatch)
    const pageProps = Component.getInitialProps ? await Component.getInitialProps(ctx) : {}

    // get list of watchers and store
    const watchers = await listArgusWatchers(ctx.req)
    await dispatch.dispatchSetWatchers(watchers)

    return {pageProps}
  }

  render() {
    const {Component, pageProps, store} = this.props
    return (
      <Container>
        <Provider store={store}>
          <Layout {...pageProps}>
            <Component {...pageProps} />
          </Layout>
        </Provider>
      </Container>
    )
  }
}

export default withRedux(initializeStore/*, {debug: true}*/)(ArgusTool)
