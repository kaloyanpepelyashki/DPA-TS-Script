/** This class is a model of the Collection object being fetched from Shopify API */
class Collection {
  constructor(public id: string, public title: string, public handle: string) {}
}

export default Collection;
