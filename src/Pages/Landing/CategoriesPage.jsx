import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Leaf } from 'lucide-react';
import { getCategories } from '../../Store/Slices/CategorySlice';
import { assetUrl } from '../../config';
import { categoryDepartment, departments } from './catalogDepartments';
import './SummerStorefront.css';

const departmentNames = new Set(departments.map(department => department.name.toLowerCase()));

export default function CategoriesPage() {
  const dispatch = useDispatch();
  const { categories, loading, error } = useSelector(state => state.categories);

  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(getCategories());
  }, [dispatch]);

  const tiles = [
    ...departments.map(department => ({
      key: department.id,
      title: department.name,
      image: `/category-photos/${department.id}.jpg`,
      link: `/?department=${department.id}#products-section`,
    })),
    ...categories.filter(category => category.isActive !== false && !departmentNames.has(category.name.toLowerCase())).map(category => ({
      key: category._id,
      title: category.name,
      image: category.image ? assetUrl(category.image) : `/category-photos/${categoryDepartment(category)?.id || 'skincare'}.jpg`,
      link: `/?category=${encodeURIComponent(category._id)}#products-section`,
    })),
  ];

  return (
    <main className="summer-storefront category-directory">
      <div className="category-directory-content">
        <Link to="/" className="category-directory-back"><ArrowLeft size={17} /> Back to store</Link>
        <h1><Leaf aria-hidden="true" /> All Categories</h1>
        <div className="category-directory-grid">
          {tiles.map(tile => (
            <Link to={tile.link} className="category-directory-card" key={tile.key}>
              <img src={tile.image} alt="" loading="lazy" onError={event => {
                if (event.currentTarget.getAttribute('src') !== '/category-photos/skincare.jpg') {
                  event.currentTarget.src = '/category-photos/skincare.jpg';
                }
              }} />
              <span>{tile.title}<ArrowRight size={17} aria-hidden="true" /></span>
            </Link>
          ))}
        </div>
        {loading && <p role="status">Loading catalog categories…</p>}
        {error && <p role="status">Additional categories could not be loaded.</p>}
      </div>
    </main>
  );
}
