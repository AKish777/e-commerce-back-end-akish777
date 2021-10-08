const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  try {
    const tagData = await Tag.findAll({
      include: [{ model: Product}],
    });
    res.status(200).json(tagData);
  }
  catch (err) {
    res.status(400).json(err);
  }
});

router.get('/:id', async (req, res) => {
  try{ 
    const tagData = await Tag.findByPk(req.params.id, {
      include: [{ model: Product }],
    });
    if (!tagData) {
      res.status(400).json({'message': 'No tag found with that ID.'})
    } else {
      res.status(200).json(tagData);
    }
  }
  catch (err) {
    res.status(400).json(err);
  }
});

router.post('/', async (req, res) => {
  try {
    const tag = await Tag.create(req.body);
    if (req.body.productIds.length) {
      const tagProductIdArr = req.body.productIds.map((product_id) => {
        return {
          tag_id: tag.id,
          product_id,
        };
      });
      const tagProductIds = await ProductTag.bulkCreate(tagProductIdArr);
      res.status(200).json(tagProductIds);
    } else {
      res.status(200).json(tag)
    }
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const tag = await Tag.update(req.body, {
      where: {
        id: req.params.id,
      },
    });
    const productTags = await ProductTag.findAll({ where: { tag_id: req.params.id } });
    const productTagIds = productTags.map(({ product_id }) => product_id);
    const newProductTags = req.body.productIds
      .filter((product_id) => !productTagIds.includes(product_id))
      .map((product_id) => {
        return {
          tag_id: req.params.id,
          product_id,
        };
      });
    const productTagsToRemove = productTags
    .filter(({ product_id }) => !req.body.productIds.includes(product_id))
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
  try{
    const tagBeingDeleted = await Tag.findByPk(req.params.id);
    await Tag.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (!tagBeingDeleted) {
      res.status(400).json({'message': 'This ID does not match any known products, Check ID and try again!'});
    } else {
      res.status(200).json([{'message': 'Product deleted successfully!'}, {id: tagBeingDeleted.id, tag_name: tagBeingDeleted.tag_name }]);
    }
  }
  catch (err) {
    res.status(400).json(err);
  }
});

module.exports = router;
