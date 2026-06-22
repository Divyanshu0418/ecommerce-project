function ProductSkeleton() {
  return (
    <div className="grid">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div className="card" key={item}>
          <div className="skeleton skeleton-img"></div>
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-text"></div>
          <div className="skeleton skeleton-button"></div>
        </div>
      ))}
    </div>
  );
}

export default ProductSkeleton;
