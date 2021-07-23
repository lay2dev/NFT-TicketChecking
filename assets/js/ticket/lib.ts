/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable camelcase */
import {
  Amount,
  AmountUnit,
  Cell,
  CellDep,
  CellInput,
  DefaultSigner,
  DepType,
  HashType,
  OutPoint,
  Platform,
  RawTransaction,
  RPC,
  Script,
  Transaction,
  WitnessArgs,
} from '@lay2/pw-core'
import { DummyProvider } from './dummy-provider'

export function getValueByKey(key: string, obj: any) {
  if (!(obj instanceof Object)) {
    throw new TypeError(`obj not an object`)
  }

  if (!Object.keys(obj).includes(key)) {
    throw new Error(`obj not has item which key = ${key}`)
  }

  return obj[key]
}

export function deserializeOutpoint(obj: any): OutPoint {
  const txHash = getValueByKey('tx_hash', obj)
  const index = getValueByKey('index', obj)
  return new OutPoint(txHash, index)
}

export function deserializeCellDep(obj: any): CellDep {
  const outpoint = deserializeOutpoint(getValueByKey('out_point', obj))

  const dep_type = getValueByKey('dep_type', obj) as string
  let depType = DepType.code
  if (dep_type === DepType.code) {
    depType = DepType.code
  } else if (dep_type === DepType.depGroup) {
    depType = DepType.depGroup
  } else {
    throw new Error(`unknown dep type ${dep_type}`)
  }
  return new CellDep(depType, outpoint)
}

export function deserializeCellDeps(obj: any): CellDep[] {
  if (!Array.isArray(obj)) {
    throw new TypeError(`obj not array, can not be cell deps`)
  }
  const cellDeps = []
  for (const item of obj) {
    cellDeps.push(deserializeCellDep(item))
  }

  return cellDeps
}

export function deserilizeHeaderDeps(obj: any): string[] {
  if (!Array.isArray(obj)) {
    throw new TypeError(`header deps is not array`)
  }

  if (obj.length > 0 && typeof obj[0] !== 'string') {
    throw new Error(`header deps[0] ${obj[0]} is not a string`)
  }

  return obj as string[]
}

export function deserializeInput(obj: any): CellInput {
  const since = getValueByKey('since', obj)
  const previousOutput = deserializeOutpoint(
    getValueByKey('previous_output', obj),
  )

  return new CellInput(previousOutput, since)
}
export function deserializeInputs(obj: any): CellInput[] {
  if (!Array.isArray(obj)) {
    throw new TypeError(`inputs is not array`)
  }

  const inputs = []
  for (const item of obj) {
    inputs.push(deserializeInput(item))
  }

  return inputs
}

export function deserializeScript(obj: any): Script {
  const codeHash = getValueByKey('code_hash', obj)
  const args = getValueByKey('args', obj)
  const hash_type = getValueByKey('hash_type', obj)

  if (![HashType.data, HashType.type].includes(hash_type)) {
    throw new Error(`unknow hash_type ${hash_type}`)
  }

  const hashType = hash_type as HashType
  return new Script(codeHash, args, hashType)
}

export function deserializeOutput(obj: any): Cell {
  const capacity = getValueByKey('capacity', obj)
  const lock = deserializeScript(getValueByKey('lock', obj))

  let type
  if (Object.keys(obj).includes('type')) {
    type = deserializeScript(getValueByKey('type', obj))
  }

  return new Cell(new Amount(capacity, AmountUnit.shannon), lock, type)
}
export function deserializeOutputs(obj: any): Cell[] {
  if (!Array.isArray(obj)) {
    throw new TypeError(`outputs is not array`)
  }

  const outputs = []
  for (const item of obj) {
    outputs.push(deserializeOutput(item))
  }

  return outputs
}

export function deserializeOutpusData(obj: any): string[] {
  if (!Array.isArray(obj)) {
    throw new TypeError(`outputs data is not array`)
  }

  if (typeof obj[0] !== 'string' && obj[0].slice(0, 2) === '0x') {
    throw new Error(`outputsData[0] ${obj[0]} is not a string prefix with 0x`)
  }

  return obj as string[]
}

export async function deserializeRawTransaction(
  obj: any,
  cells?: Cell[],
  rpc?: RPC,
): Promise<RawTransaction> {
  const version = getValueByKey('version', obj)
  const cell_deps = deserializeCellDeps(getValueByKey('cell_deps', obj))
  const header_deps = deserilizeHeaderDeps(getValueByKey('header_deps', obj))
  const inputs = deserializeInputs(getValueByKey('inputs', obj))
  const outputs = deserializeOutputs(getValueByKey('outputs', obj))
  const outputsData = deserializeOutpusData(getValueByKey('outputs_data', obj))

  if (outputs.length !== outputsData.length) {
    throw new Error(
      `outputs length not equal with outputsData length: ${outputs.length} !== ${outputsData.length}`,
    )
  }
  outputs.forEach((v: any, i) => {
    outputs[i].setHexData(outputsData[i])
  })

  const inputCells = await Promise.all(
    inputs.map(async (x) => {
      const findCells = cells?.filter(
        (y) => y.outPoint?.serializeJson() === x.previousOutput.serializeJson(),
      )

      if (findCells && findCells.length > 0) {
        return findCells[0]
      }
      if (rpc) return await Cell.loadFromBlockchain(rpc, x.previousOutput)

      throw new Error(`can not load cell by outpoint ${x.previousOutput}`)
    }),
  )

  const rawTx = new RawTransaction(
    inputCells,
    outputs,
    cell_deps,
    header_deps,
    version,
  )

  rawTx.inputs = inputs

  return rawTx
}

export function deserializeWitnesses(obj: any): string[] {
  if (!Array.isArray(obj)) {
    throw new TypeError(`outputs data is not array`)
  }

  if (typeof obj[0] !== 'string' && obj[0].slice(0, 2) === '0x') {
    throw new Error(`outputsData[0] ${obj[0]} is not a string prefix with 0x`)
  }

  return obj as string[]
}

export function deserializeBytesOpt(obj: Buffer): string {
  if (obj.length === 0) return ''
  const bytesSize = obj.readUInt32LE(0)
  if (bytesSize + 4 !== obj.length) {
    throw new Error(
      `bytes length != bytesSize, ${bytesSize + 4} !== ${obj.length}`,
    )
  }
  return '0x' + obj.slice(4).toString('hex')
}
/**
 * convert moleculed string to object
 *
 * @param obj
 * @returns
 */
export function deserializeWitnessArgs(obj: string): WitnessArgs {
  const buffer = Buffer.from(obj.replace('0x', ''), 'hex')

  const totalSize = buffer.readUInt32LE(0)

  const lockOffset = buffer.readUInt32LE(4)
  const inputTypeOffset = buffer.readUInt32LE(8)
  const outputTypeOffset = buffer.readUInt32LE(12)

  const lock = deserializeBytesOpt(buffer.slice(lockOffset, inputTypeOffset))
  const input_type = deserializeBytesOpt(
    buffer.slice(inputTypeOffset, outputTypeOffset),
  )
  const output_type = deserializeBytesOpt(buffer.slice(outputTypeOffset))

  console.log('totalSize', totalSize)
  //   console.log('lockOffset', lockOffset);
  //   console.log('inputTypeOffset', inputTypeOffset);
  //   console.log('outputTypeOffset', outputTypeOffset);

  return { lock, input_type, output_type }
}

export async function deserializeTransaction(
  obj: any,
  cells?: Cell[],
  rpc?: RPC,
): Promise<Transaction> {
  const rawTx = await deserializeRawTransaction(obj, cells, rpc)
  const witnesses = deserializeWitnesses(getValueByKey('witnesses', obj))

  const tx = new Transaction(rawTx, [])
  const signer = new DefaultSigner(new DummyProvider(Platform.ckb))
  const lockGroupFirstIndexs = signer.toMessages(tx).map((x) => x.index)

  //   console.log('lockGroupFirstIndexs', lockGroupFirstIndexs);

  const witnessArgs = witnesses.map((x, i) => {
    if (lockGroupFirstIndexs.includes(i)) {
      return deserializeWitnessArgs(witnesses[i])
    }
    return x
  })
  //   console.log('witnessArgs', witnessArgs);

  return new Transaction(rawTx, witnessArgs)
}
