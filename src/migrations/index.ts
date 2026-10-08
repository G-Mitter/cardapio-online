import * as migration_20261006_142144_initial from './20261006_142144_initial';
import * as migration_20261008_110821_alt_opcional from './20261008_110821_alt_opcional';
import * as migration_20261008_112229_capa_da_loja from './20261008_112229_capa_da_loja';

export const migrations = [
  {
    up: migration_20261006_142144_initial.up,
    down: migration_20261006_142144_initial.down,
    name: '20261006_142144_initial',
  },
  {
    up: migration_20261008_110821_alt_opcional.up,
    down: migration_20261008_110821_alt_opcional.down,
    name: '20261008_110821_alt_opcional',
  },
  {
    up: migration_20261008_112229_capa_da_loja.up,
    down: migration_20261008_112229_capa_da_loja.down,
    name: '20261008_112229_capa_da_loja'
  },
];
