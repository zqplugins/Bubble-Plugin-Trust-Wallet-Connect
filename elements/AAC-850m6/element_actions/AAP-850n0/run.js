function(instance, properties, context) {

    (async function(){
        if (instance.data.injectedProvider) {

            //instance.data.injectedProvider.removeListener("accountsChanged");
            //instance.data.injectedProvider.removeListener("chainChanged");

            instance.data.injectedProvider = await instance.data.getTrustWalletInjectedProvider();;
            instance.publishState("is_connected", false);
            instance.publishState("address_id", null);
            instance.publishState("chain_id", null);

            instance.triggerEvent("disconnected");
        }
    })()

}