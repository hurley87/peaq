import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

// https://sepolia.basescan.org/address/0x1428c1573159CA958FE39D4998E0C4a3346130f1#writeContract

const TraitsModule = buildModule('TraitsModule', (m) => {
  const traits = m.contract('Traits', []);

  return { traits };
});

export default TraitsModule;
