import CollectionsDAO from "../ServiceLayer/CollectionsDAO";

class CollectionsMap {
    protected dpaCollectionsMap: Map<number, Array<number>> = new Map();
    protected dpaCollectionIds: Array<number> = [608081805635, 608081871171, 608081674563, 608081641795]
    protected collectionsDAO: CollectionsDAO = CollectionsDAO.getInstance();
    constructor() {}

    public async initialize() {
        await this.updateCollectionsMap();
    }
    
    private async updateCollectionsMap() {
        console.log("In updateCollectionsMap")
        for(const collectionId of this.dpaCollectionIds) {
            const collectionProducts = await this.collectionsDAO.getCollectionProducts(collectionId);
            const productsArray: Array<number> = [];

            collectionProducts.products.forEach((product) => {
                productsArray.push(product.id);
            })

            this.dpaCollectionsMap.set(collectionId, productsArray);
        }
    }

    public getDpaCollectionsMap() {
        return this.dpaCollectionsMap;
    }
}

export default CollectionsMap;