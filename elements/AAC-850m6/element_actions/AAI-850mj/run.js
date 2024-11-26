function(instance, properties, context) {

    (async function(){
        try {
            let id_hex = instance.data.web3.utils.numberToHex(properties.chain_id);
            await instance.data.injectedProvider.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: id_hex }],
            });
        } catch (error) {
            instance.publishState("error", error.message);
            instance.triggerEvent("error");
        }
    })()

}