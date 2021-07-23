import {
  Amount,
  AmountUnit,
  Cell,
  CellDep,
  HashType,
  OutPoint,
  Script,
} from '@lay2/pw-core'
import axios from 'axios'

interface CellDepApi {
  data: CellDep[]
  code: number
}

interface CellApiData {
  id: number
  blockHash: string
  lock: {
    codeHash: string
    hashType: string
    args: string
  }
  outPoint: {
    txHash: string
    index: string
  }
  outputDataLen: string
  capacity: string
  cellbase: true
  type: {
    codeHash: string
    hashType: string
    args: string
  }
  dataHash: string
  status: string
  sudtAmount: string
  data: string
}

export async function getCellDeps(): Promise<CellDep[]> {
  const url = process.env.CELL_DEPS_API as string
  const params = [
    {
      codeHash: process.env.NFT_TYPE_ID,
      hashType: 'type',
      args: '0x',
    },
    {
      codeHash: process.env.UNIPASS_TYPE_ID,
      hashType: 'type',
      args: '0x',
    },
  ]
  const ret = await axios.post(url, params)
  const data = ret.data as CellDepApi
  console.log(data.data)
  return data.data
}

export async function getCellsByOutpoints(params: OutPoint[]): Promise<Cell[]> {
  const url = process.env.PW_GET_CELL_API as string
  const ret = await axios.post(url, params)
  const list = ret.data.data as CellApiData[]
  const cells = []
  for (const item of list) {
    const capacity = new Amount(item.capacity, AmountUnit.shannon)
    const typescript = new Script(
      item.type.codeHash,
      item.type.args,
      item.type.hashType as HashType,
    )

    const lockscript = new Script(
      item.lock.codeHash,
      item.lock.args,
      item.lock.hashType as HashType,
    )

    const outPoint = new OutPoint(item.outPoint.txHash, item.outPoint.index)
    const cell = new Cell(capacity, lockscript, typescript, outPoint, item.data)
    cells.push(cell)
  }
  return cells
}
