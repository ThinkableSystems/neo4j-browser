/*
 * Copyright (c) 2002-2017 "Neo Technology,"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Component } from 'preact'
import { v4 } from 'uuid'
import { StyledStatsBar, PaddedTableViewDiv, StyledBodyMessage } from '../styled'
import Ellipsis from 'browser-components/Ellipsis'
import {StyledTable, StyledBodyTr, StyledTh, StyledTd, StyledJsonPre} from 'browser-components/DataTables'
import bolt from 'services/bolt/bolt'
import { deepEquals, shallowEquals } from 'services/utils'
import { getBodyAndStatusBarMessages, getRecordsToDisplayInTable } from './helpers'

const toTable = (records) => records && records.length ? bolt.recordsToTableArray(records) : undefined

const renderCell = (entry) => {
  if (Array.isArray(entry)) {
    const children = entry.map((item, index) => <span>{renderCell(item)}{index === entry.length - 1 ? null : ', '}</span>)
    return <span>[{children}]</span>
  } else if (typeof entry === 'object') {
    return renderObject(entry)
  } else {
    return JSON.stringify(entry)
  }
}
const renderObject = (entry) => {
  if (Object.keys(entry).length === 0 && entry.constructor === Object) {
    return <em>(empty)</em>
  } else {
    return <StyledJsonPre>{JSON.stringify(entry, null, 2)}</StyledJsonPre>
  }
}
const buildData = (entries) => {
  return entries.map((entry) => {
    if (entry !== null) {
      return <StyledTd className='table-properties' key={v4()}>{renderCell(entry)}</StyledTd>
    }
    return <StyledTd className='table-properties' key={v4()}>(empty)</StyledTd>
  })
}
const buildRow = (item) => {
  return (
    <StyledBodyTr className='table-row' key={v4()}>
      {buildData(item)}
    </StyledBodyTr>
  )
}

export class TableView extends Component {
  constructor (props) {
    super(props)
    this.state = {
      columns: [],
      data: [],
      bodyMessage: ''
    }
  }
  componentDidMount () {
    this.makeState(this.props)
  }
  componentWillReceiveProps (props) {
    if (this.props === undefined ||
      this.props.result === undefined ||
      !deepEquals(props.result.records, this.props.result.records)
    ) {
      this.makeState(props)
    }
  }
  shouldComponentUpdate (props, state) {
    return !shallowEquals(state, this.state)
  }
  makeState (props) {
    const records = getRecordsToDisplayInTable(props.result, props.maxRows)
    const table = toTable(records) || []
    const data = table ? table.slice() : []
    const columns = data.length > 0 ? data.shift() : []
    const { bodyMessage } = getBodyAndStatusBarMessages(props.result, props.maxRows)
    this.setState({ data, columns, bodyMessage })
  }
  render () {
    if (!this.state.columns.length) return (<PaddedTableViewDiv><StyledBodyMessage>{this.state.bodyMessage}</StyledBodyMessage></PaddedTableViewDiv>)
    const tableHeader = this.state.columns.map((column, i) => (
      <StyledTh className='table-header' key={i}>{column}</StyledTh>)
    )
    const tableBody = <tbody>{this.state.data.map((item) => buildRow(item))}</tbody>
    return (
      <PaddedTableViewDiv>
        <StyledTable>
          <thead>
            <tr>
              {tableHeader}
            </tr>
          </thead>
          {tableBody}
        </StyledTable>
      </PaddedTableViewDiv>
    )
  }
}

export class TableStatusbar extends Component {
  constructor (props) {
    super(props)
    this.state = {
      statusBarMessage: ''
    }
  }
  componentDidMount () {
    this.makeState(this.props)
  }
  componentWillReceiveProps (props) {
    this.makeState(props)
  }
  shouldComponentUpdate (props, state) {
    if (!shallowEquals(state, this.state)) return true
    return false
  }
  makeState (props) {
    const { statusBarMessage } = getBodyAndStatusBarMessages(props.result, props.maxRows)
    if (statusBarMessage !== undefined) this.setState({ statusBarMessage })
  }
  render () {
    return (
      <StyledStatsBar>
        <Ellipsis>
          {this.state.statusBarMessage }
        </Ellipsis>
      </StyledStatsBar>
    )
  }
}
