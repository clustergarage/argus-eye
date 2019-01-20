import App, {Container} from 'next/app'
import React from 'react'
import {Provider} from 'react-redux'
import withRedux from 'next-redux-wrapper'

import Layout from '../components/Layout'
import {initializeStore} from '../store/store'
import {listArgusWatchers} from '../lib/api'

class ArgusTool extends App {
  static async getInitialProps({Component, ctx}) {
    const pageProps = Component.getInitialProps ? await Component.getInitialProps(ctx) : {}
    const watchers = await listArgusWatchers(ctx.req)
    return {
      pageProps,
      watchers,
    }
  }

  render() {
    const {Component, pageProps, store, watchers} = this.props
    let passProps = {...pageProps, watchers}
    return (
      <Container>
        <Provider store={store}>
          <Layout {...passProps}>
            <Component {...passProps} />
          </Layout>
        </Provider>
      </Container>
    )
  }
}

export default withRedux(initializeStore)(ArgusTool)
