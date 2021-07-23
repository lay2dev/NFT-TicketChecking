import {
  Address,
  Builder,
  BuilderOption,
  Cell,
  CellDep,
  RawTransaction,
  Transaction,
} from '@lay2/pw-core'

export class TicketBuilder extends Builder {
  constructor(
    private address: Address,
    protected nftCells: Cell[],
    protected options: BuilderOption = {},
    private cellDeps: CellDep[],
    private since: string = '0x0',
  ) {
    super(options.feeRate, options.collector, options.witnessArgs)
  }

  // eslint-disable-next-line require-await
  async build(): Promise<Transaction> {
    const inputCells: Cell[] = []
    const outputCells: Cell[] = []

    if (this.nftCells.length === 0) {
      throw new Error(`no live cells, not neccessary to build tx`)
    }

    for (const cell of this.nftCells) {
      inputCells.push(cell)
      const data = cell.getHexData().slice(2)
      const start = data.slice(0, 20)
      const end = data.slice(22)
      const state = '00'
      const outData = `0x${start}${state}${end}`
      const outputCell = cell.clone()
      outputCell.lock = this.address.toLockScript()
      outputCell.setHexData(outData)
      outputCells.push(outputCell)
    }

    // build tx
    const rawOtx = new RawTransaction(inputCells, outputCells, this.cellDeps)
    for (let i = 0; i < rawOtx.inputs.length - 1; i++) {
      rawOtx.inputs[i].since = this.since
    }
    const otx = new Transaction(rawOtx, [this.witnessArgs])

    return otx
  }
}
