import { CellDep, DepType, OutPoint } from '@lay2/pw-core'
interface AllCellDeps {
  rsaDep: CellDep
  acpDep: CellDep
  unipassDep: CellDep
}

const LinaCellDeps = {
  rsaDep: new CellDep(
    DepType.code,
    new OutPoint(
      '0x1196caaf9e45f1959ea3583f92914ee8306d42e27152f7068f9eeb52ac23eeae',
      '0x0',
    ),
  ),
  acpDep: new CellDep(
    DepType.code,
    new OutPoint(
      '0xf247a0e9dfe9d559ad8486428987071b65d441568075465c2810409e889f4081',
      '0x0',
    ),
  ),
  unipassDep: new CellDep(
    DepType.code,
    new OutPoint(
      '0xb05e45161a0887288eaf6940c90cc41cdb578495c8b1b285411b4e651f34f3f3',
      '0x0',
    ),
  ),
}

export function cellDeps(): AllCellDeps {
  return LinaCellDeps
}
