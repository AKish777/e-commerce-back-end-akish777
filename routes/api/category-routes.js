const router = require('express').Router();
const { Category, Product } = require('../../models');

router.get('/', async (req, res) => {
  try {
    const catData = await Category.findAll({
      include: [{ model: Product }],
    });
    res.status(200).json(catData);
  } catch(err) {
    res.status(500).json(err);
    };
});

router.get('/:id', async (req, res) => {
  try {
    const catData = await Category.findByPk(req.params.id, {
      include: [{ model: Product }],
    });
    if (!catData) {
      res.status(400).json({message: 'This ID does not match any known categories, Check ID and try again!'});
      return;
    } else {
      res.status(200).json(catData);
    }
  } catch (err) {
    res.status(400).json(err);
  }
});

router.post('/', async (req, res) => {
  try {
    const catData = await Category.create({
      category_name: req.body.category_name,
    });
    res.status(200).json([{'message': 'Category added successfully!'}, {id: catData.id, category_name: catData.category_name}]);
  } catch (err) {
    res.status(400).json(err)
  };
});

router.put('/:id', async (req, res) => {
  try {
    const catData = await Category.update(req.body, {
      where: {
        id: req.params.id,
      },
    });
    if (!catData) {
      res.status(400).json({'message': 'CThis ID does not match any known categories, Check ID and try again!'});
    } else {
      res.status(200).json([{'message': 'Category update successful!'}, {id: req.body.id, category_name: req.body.category_name}]);
    }
  } catch (err) {
    res.status(400).json(err);
  } 
});

router.delete('/:id', async (req, res) => {
  try {
    const catDataDeleted = await Category.findByPk(req.params.id);
    await Category.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (!catDataDeleted) {
      res.status(400).json({'message': 'This ID does not match any known categories, Check ID and try again!'});
    } else {
      res.status(200).json([{'message': 'Category delete successful!'}, {id: catDataDeleted.id, category_name: catDataDeleted.category_name}]);
    }
  }
  catch (err) {
    res.status(400).json(err);
  }
});

module.exports = router;