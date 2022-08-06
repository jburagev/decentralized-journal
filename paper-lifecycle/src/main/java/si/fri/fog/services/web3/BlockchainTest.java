package si.fri.fog.services.web3;

import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.request.EthFilter;
import org.web3j.protocol.core.methods.response.EthGasPrice;
import org.web3j.protocol.core.methods.response.EthGetBalance;
import org.web3j.protocol.core.methods.response.Web3ClientVersion;
import org.web3j.protocol.http.HttpService;
import org.web3j.protocol.websocket.WebSocketService;
import org.web3j.utils.Convert;

import java.io.IOException;
import java.util.concurrent.ExecutionException;

public class BlockchainTest {

    public void callFunction() throws IOException {
        Web3j web3 = Web3j.build(new HttpService("http://127.0.0.1:7545"));
        try {
            Web3ClientVersion clientVersion = web3.web3ClientVersion().send();
            System.out.println("Client version: " + clientVersion.getWeb3ClientVersion());

            EthGasPrice gasPrice = web3.ethGasPrice().send();
            System.out.println("Default Gas Price: " + gasPrice.getGasPrice());

            EthGetBalance ethGetBalance = web3
                    .ethGetBalance("0x91CE50F4ed4e4Ddb52B7a02fBC1E57717ad4A7e0", DefaultBlockParameterName.LATEST)
                    .sendAsync().get();

            System.out.println("Balance: of Account 0x91CE50F4ed4e4Ddb52B7a02fBC1E57717ad4A7e0 is "
            + ethGetBalance.getBalance());

            System.out.println("Balance in Ether format: "
            + Convert.fromWei(web3.ethGetBalance("0x91CE50F4ed4e4Ddb52B7a02fBC1E57717ad4A7e0",
                    DefaultBlockParameterName.LATEST).send().getBalance().toString(), Convert.Unit.ETHER));

        } catch (IOException ex) {
            throw new RuntimeException("Error whilst sending json-rpc requests", ex);
        } catch (ExecutionException | InterruptedException e) {
            throw new RuntimeException(e);
        }
    }
}
