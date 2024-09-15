import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const SolarSeekersModule = buildModule('SolarSeekersModule', (m) => {
  const TRAITS_CONTRACT = '0x73EB5801F1eE27A1D673b9BDbAefd08CA8397BF7';
  const solarSeeker = m.contract('SolarSeekers', [TRAITS_CONTRACT]);

  return { solarSeeker };
});

export default SolarSeekersModule;
