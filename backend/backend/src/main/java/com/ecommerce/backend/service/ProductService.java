package com.ecommerce.backend.service;

import com.cloudinary.Cloudinary;
import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private Cloudinary cloudinary;

//  GET ALL PRODUCTS
    public List<Product> getAllProducts(){
        return productRepository.findAll();
    }

//  GET Product By ID
    public Product getProductById(Long id){
        return productRepository.findById(id).orElse(null);
    }

//  ADD Product
    public Product addProduct(Product product){
        return productRepository.save(product);
    }

//  UPDATE Product
    public Product updateProduct(Long id, Product product){

        Product existingProduct = productRepository.findById(id).orElse(null);

        if(existingProduct != null){

            existingProduct.setName(product.getName());
            existingProduct.setPrice(product.getPrice());

            return productRepository.save(existingProduct);
        }

        return null;
    }

    public void deleteProduct(Long id){
        productRepository.deleteById(id);
    }

    public List<Product> searchByName(String name) {
        return productRepository.findByNameContainingIgnoreCase(name);
    }

    public List<Product> filterByCategory(String category) {
        return productRepository.findByCategoryIgnoreCase(category);
    }

    public List<Product> filterByPrice(double minPrice, double maxPrice) {
        return productRepository.findByPriceBetween(minPrice, maxPrice);
    }

    public Product uploadProductImage(Long productId, MultipartFile file) throws IOException {

        Product product = productRepository.findById(productId).orElse(null);

        if (product == null) {
            return null;
        }

        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), Map.of());

        String imageUrl = uploadResult.get("secure_url").toString();

        product.setImageUrl(imageUrl);

        return productRepository.save(product);
    }

}
