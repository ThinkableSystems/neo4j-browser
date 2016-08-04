import React from 'react'
import { FrameTitlebar } from './FrameTitlebar'
import FrameTemplate from './FrameTemplate'
import asciitable from 'ascii-data-table'
import bolt from '../../../../services/bolt/bolt'
import visualization from '../../visualization'

import styles from './style_cypher.css'

class CypherFrame extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      openView: 'text'
    }
  }

  onNavClick (viewName) {
    this.setState({openView: viewName})
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.frame.result !== this.props.frame.result) {
      this.state.nodesAndRelationships = bolt.extractNodesAndRelationshipsFromRecords(nextProps.frame.result.records)
      this.state.rows = bolt.recordsToTableArray(nextProps.frame.result.records)
    }
  }

  render () {
    const frame = this.props.frame
    const errors = frame.error && frame.error.fields || false
    const result = frame.result || false
    let frameContents = <pre>{JSON.stringify(result, null, 2)}</pre>
    if (result.records && result.records.length > 0) {
      this.state.nodesAndRelationships = this.state.nodesAndRelationships || bolt.extractNodesAndRelationshipsFromRecords(result.records)
      if (this.state.nodesAndRelationships.nodes.length > 0) {
        frameContents = (
          <div className={styles.svg}>
            <visualization.components.Explorer useContextMenu nodes={this.state.nodesAndRelationships.nodes} relationships={this.state.nodesAndRelationships.relationships}/>
          </div>
        )
      } else {
        this.state.rows = this.state.rows || bolt.recordsToTableArray(result.records)
        frameContents = <pre>{asciitable.run(this.state.rows)}</pre>
      }
    } else if (errors) {
      frameContents = (
        <div>
          {errors[0].code}
          <pre>{errors[0].message}</pre>
        </div>
      )
    } else if (result) {
      frameContents = (
        <div>
          <pre>{JSON.stringify(frame, null, '\t')}</pre>
        </div>
      )
    }
    return (
      <FrameTemplate
        header={<FrameTitlebar frame={frame} />}
        contents={frameContents}
      />
    )
  }
}

export {
  CypherFrame
}
