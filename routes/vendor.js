const express = require('express')
const vendorHelpers = require('../helpers/vendor-helpers')
const router = express.Router()

router.get('/', (req, res) => {
  if (req.session.logged) {
    const { vendor } = req.session
    res.render('vendor/dashboard', { vendor })
  } else {
    res.render('vendor/login', { vendor: true })
  }
})

router.post('/login', (req, res) => {
  vendorHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.logged = true
      req.session.vendor = response.vendor

      if (req.session.vendor.isActive == true) {
        res.redirect('/vendor')
      } else {
        req.session.blockedd = true
        res.redirect('vendor/login')
      }
    } else {
      req.session.loginError = true
      res.redirect('/vendor')
    }
  })
})

router.get('/login', (req, res) => {
  if (req.session.logged) {
    if (req.session.vendor.isActive) {
      res.redirect('/vendor')
    } else {
      res.render('vendor/login', { blockedVendor: req.session.blockedd })
      req.session.blockedd = false
    }
  } else {
    res.render('vendor/login', { loginError: req.session.loginError, vendor: true })
    req.session.loginError = false
  }
})

router.get('/signup', (req, res) => {
  if (req.session.logged) {
    res.redirect('/vendor')
  } else {
    res.render('vendor/signup', { alreadyexistv: req.session.alreadyexistv, vendor: true })
  }
})

router.post('/signup', (req, res) => {
  vendorHelpers.doSignup(req.body).then((response) => {
    res.render('vendor/login', { vendor: true })
  }).catch(() => {
    req.session.alreadyexistv = true
    res.render('vendor/signup', { vendor: true })
  })
})

router.get('/dashboard', (req, res) => {
  if (req.session.logged) {
    res.render('vendor/dashboard', { vendor: true })
  } else {
    res.redirect('/vendor')
  }
})

router.get('/addproducts', (req, res) => {
  if (req.session.logged) {
    res.render('vendor/addProducts', { vendor: true })
  } else {
    res.redirect('/vendor')
  }
})


router.post('/addproduct', (req, res) => {
  vendorHelpers.addProduct(req.body, req.session.vendor._id).then((id) => {
    if (req.files) {
      if (req.files.image1) {
        addImage(req.files.image1, 1, id)
      }
      if (req.files.image2) {
        addImage(req.files.image2, 2, id)
      }
      if (req.files.image3) {
        addImage(req.files.image3, 3, id)
      }
      if (req.files.image4) {
        addImage(req.files.image4, 4, id)
      }
    }
    res.render('vendor/product-added', { vendor: req.session.vendor })
  })
})

router.get('/viewproducts', (req, res) => {
  if (req.session.logged) {
    vendorData = req.session.vendor
    vendorHelpers.viewProducts(vendorData).then((products) => {
      res.render('vendor/viewproducts', { vendor: true, products, vendorData })
    })
  } else {
    res.redirect('/vendor')
  }
})

function addImage(image, n, id) {
  image.mv(`public/images/productsImages/${id}(${n})` + '.jpg')
}
router.get('/viewProduct/:id', (req, res) => {
  if (req.session.logged) {
    vendorData = req.session.vendor
    vendorHelpers.getProductDetails(req.params.id).then((product) => {
      res.render('vendor/viewproduct', { vendor: true, product })
    })
  } else {
    res.redirect('/vendor')
  }
})
router.get('/deleteProduct/:id', (req, res) => {
  vendorHelpers.deleteProduct(req.params.id).then(() => {
    res.redirect('/vendor/viewproducts')
  })
})

router.get('/editProduct/:id', (req, res) => {
  vendorHelpers.getProductDetails(req.params.id).then((product) => {
    res.render('vendor/editproduct', { vendor: true, product })
  })
})

router.post('/editProduct/:id', (req, res) => {
  productId = req.params.id
  productInfo = req.body
  vendorHelpers.updateProduct(productId, productInfo).then((data) => {
    res.render('vendor/updateSuccess', { vendor: true, })
  })
})

router.get('/logout', (req, res) => {
  req.session.logged = false
  res.redirect('/vendor')
})

module.exports = router 
