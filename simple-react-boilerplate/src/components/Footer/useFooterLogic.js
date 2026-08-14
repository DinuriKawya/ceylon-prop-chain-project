import { scrollToSection } from '../../utils/helpers';

const useFooterLogic = (setActiveTab) => {
  const handleTabChange = (e, tab) => {
    e.preventDefault();
    setActiveTab(tab);
  };

  const handleScrollToSection = (e, section) => {
    e.preventDefault();
    scrollToSection(section, setActiveTab);
  };

  return {
    handleTabChange,
    handleScrollToSection
  };
};

export default useFooterLogic;
