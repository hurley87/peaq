import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

// https://sepolia.basescan.org/address/0x1428c1573159CA958FE39D4998E0C4a3346130f1#writeContract

const QuestsModule = buildModule('QuestsModule', (m) => {
  const quests = m.contract('QuestsFactory', []);

  return { quests };
});

export default QuestsModule;
