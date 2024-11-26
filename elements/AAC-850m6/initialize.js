function(instance, context) {

    instance.data.getTrustWalletInjectedProvider = async function(
    { timeout } = { timeout: 3000 }
    ) {
        const provider = getTrustWalletFromWindow();

        if (provider) {
            return provider;
        }

        return listenForTrustWalletInitialized({ timeout });
    }

    async function listenForTrustWalletInitialized(
    { timeout } = { timeout: 3000 }
    ) {
        return new Promise((resolve) => {
            const handleInitialization = () => {
                resolve(getTrustWalletFromWindow());
            };

            window.addEventListener("trustwallet#initialized", handleInitialization, {
                once: true,
            });

            setTimeout(() => {
                window.removeEventListener(
                    "trustwallet#initialized",
                    handleInitialization,
                    { once: true }
                );
                resolve(null);
            }, timeout);
        });
    }

    function getTrustWalletFromWindow() {
        const isTrustWallet = (ethereum) => {
            const trustWallet = !!ethereum.isTrust;

            return trustWallet;
        };

        const injectedProviderExist =
              typeof window !== "undefined" && typeof window.ethereum !== "undefined";

        if (!injectedProviderExist) {
            return null;
        }

        if (isTrustWallet(window.ethereum)) {
            return window.ethereum;
        }

        if (window.ethereum.providers) {
            return window.ethereum.providers.find(isTrustWallet) ?? null;
        }

        return window["trustwallet"] ? window["trustwallet"] : null;
    }

    (async function(){
        instance.data.injectedProvider = await instance.data.getTrustWalletInjectedProvider();

        if(!instance.data.injectedProvider){
            instance.publishState("trust_installed", false);
            console.warn("Trust is not detected");
            return;
        }
        instance.publishState("trust_installed", true);
        

        instance.data.web3 = new Web3(instance.data.injectedProvider);

        if(instance.data.injectedProvider.address){
            const accounts = await instance.data.injectedProvider.request({
                method: "eth_accounts",
            });
            instance.publishState("is_connected", accounts[0] ? true : false);
            instance.publishState("address_id", accounts[0]);
            
            instance.publishState("chain_id", instance.data.web3.utils.hexToNumber(instance.data.injectedProvider.chainId()));
        }
        
        if(instance.data.injectedProvider){

            instance.data.injectedProvider.on("accountsChanged", (accounts) => {
                if (accounts.length === 0) {
                    instance.data.injectedProvider = null;
                    instance.publishState("is_connected", false);
                    instance.publishState("address_id", null);
                    instance.publishState("chain_id", null);

                    instance.triggerEvent("disconnected");
                } else {
                    instance.publishState("address_id", accounts[0]);
                    instance.publishState("is_connected", true);
                    instance.triggerEvent("connected");
                }
            });

            instance.data.injectedProvider.on("chainChanged", (id) => {                
                instance.publishState("chain_id", instance.data.web3.utils.hexToNumber(id));
                instance.triggerEvent("chain_changed");
            });
        }


        /*
        console.log(instance.data.injectedProvider);
        window.injectedProvider = instance.data.injectedProvider;
        window.web333 = web3;

        instance.data.injectedProvider._request({
            "id": 1,
            "jsonrpc": "2.0",
            "method": "wallet_requestPermissions",
            "params": [
                {
                    "eth_accounts": {}
                }
            ]
        }).then(res=>{
            console.log(res);
        })
        */

    })()


}