
module cart::cart {

    use sui::coin;

    public struct CART has drop {}

    fun init(otw: CART, ctx: &mut TxContext){
        let (treasury_cap, metadata) = coin::create_currency<CART>(
            otw,
            9,  
            b"CART",
            b"CART Coin",
            b"Cart Native Coin",
            option::none(),
            ctx
        );

        transfer::public_transfer(treasury_cap, ctx.sender());
        transfer::public_freeze_object(metadata);
    }
}