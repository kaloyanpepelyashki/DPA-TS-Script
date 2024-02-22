import CollectionsTotalWeightMap from "./BLOC/CollectionsTotalWeighMap";

const main = async () => {
  const collectionsTotal = new CollectionsTotalWeightMap();
  const collectionsTotalWeight =
    await collectionsTotal.getCollectionsTotalWeight();

  console.log(collectionsTotalWeight);
};
main();
