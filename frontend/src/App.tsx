import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Blocks } from './pages/Blocks';
import { Block } from './pages/Block';
import { BlockIndexRedirect } from './pages/BlockIndexRedirect';
import { Transaction } from './pages/Transaction';
import { Address } from './pages/Address';
import { FluxNodes } from './pages/FluxNodes';
import { RichList } from './pages/RichList';
import { Pools } from './pages/Pools';
import { Stats } from './pages/Stats';
import { StatChart } from './pages/StatChart';
import { Charts } from './pages/Charts';
import { Status } from './pages/Status';
import { Network } from './pages/Network';
import { Broadcast } from './pages/Broadcast';
import { Mempool } from './pages/Mempool';
import { VerifyMessage } from './pages/VerifyMessage';
import { NotFound } from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="blocks" element={<Blocks />} />
        <Route path="blocks-date/:blockDate" element={<Blocks />} />
        <Route path="blocks-date/:blockDate/:startTimestamp" element={<Blocks />} />
        <Route path="block/:blockHash" element={<Block />} />
        <Route path="block-index/:blockHeight" element={<BlockIndexRedirect />} />
        <Route path="mempool" element={<Mempool />} />
        <Route path="tx/send" element={<Broadcast />} />
        <Route path="tx/:txId" element={<Transaction />} />
        <Route path="tx/:txId/:vType/:vIndex" element={<Transaction />} />
        <Route path="address/:addrStr" element={<Address />} />
        <Route path="fluxnodes" element={<FluxNodes />} />
        <Route path="rich-list" element={<RichList />} />
        <Route path="pools" element={<Pools />} />
        <Route path="pools/:date" element={<Pools />} />
        <Route path="stats" element={<Stats />} />
        <Route path="stats/:type/:days" element={<StatChart />} />
        <Route path="charts" element={<Charts />} />
        <Route path="status" element={<Status />} />
        <Route path="network" element={<Network />} />
        <Route path="messages/verify" element={<VerifyMessage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
