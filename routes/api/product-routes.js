const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

router.get('/', async (req, res) => {
  try {
    const productData = await Product.findAll({
      include: [{ model: Category }, { model: Tag }],
    });
    res.status(200).json(productData);
  } 
  catch(err) {
    res.status(500).json(err);
  };
});

router.get('/:id', async (req, res) => {
  try {
    const productData = await Product.findByPk(req.params.id, {
      include: [{ model: Category}, { model: Tag }]
    });
    if (!productData) {
      res.status(400).json({'message': 'This ID does not match any known products, Check ID and try again!'})
    } else {
      res.status(200).json(productData);
    };
  }
  catch (err) {
    res.status(400).json(err);
  }
});

router.post('/', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    if (req.body.tagIds.length) {
      const productTagIdArr = req.body.tagIds.map((tag_id) => {
        return {
          product_id: product.id,
          tag_id,
        };
      });
      const productTagIds = await ProductTag.bulkCreate(productTagIdArr);
      res.status(200).json(productTagIds);
    } else {
      res.status(200).json(product);
    };
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const product = await Product.update(req.body, {
      where: {
        id: req.params.id,
      },
    });
    const productTags = await ProductTag.findAll({ where: { product_id: req.params.id } });
    const productTagIds = productTags.map(({ tag_id }) => tag_id);
    const newProductTags = req.body.tagIds
      .filter((tag_id) => !productTagIds.includes(tag_id))
      .map((tag_id) => {
        return {
          product_id: req.params.id,
          tag_id,
        };
      });
    const productTagsToRemove = productTags
      .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
      .map(({ id }) => id);

    const updatedProductTags = await Promise.all([
      ProductTag.destroy({ where: { id: productTagsToRemove } }),
      ProductTag.bulkCreate(newProductTags),
    ]);
    res.status(200).json(updatedProductTags);
  }
  catch (err) {
    res.status(400).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const productBeingDeleted = await Product.findByPk(req.params.id);
    await Product.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (!productBeingDeleted) {
      res.status(400).json({'message': 'This ID does not match any known products, Check ID and try again!'});
    } else {
      res.status(200).json([{'message': 'Product deleted successfully!'}, {id: productBeingDeleted.id, product_name: productBeingDeleted.product_name}]);
    }
  }
  catch (err) {
    res.status(400).json(err);
  }
});


module.exports = router;