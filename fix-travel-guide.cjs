const fs = require('fs');

let content = fs.readFileSync('src/components/TravelGuide.tsx', 'utf8');

const regexMain = /\{\/\* Main Hero Featured Article \*\/\}\s*<motion\.article[\s\S]*?<\/motion\.article>/;

const replacementMain = `{/* Main Hero Featured Article */}
          <motion.article 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-7"
          >
            <a href={MAIN_ARTICLE.url} className="card-article-featured h-full group">
              <img 
                src={MAIN_ARTICLE.image || DEFAULT_FALLBACK_IMAGE} 
                alt={MAIN_ARTICLE.title}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== DEFAULT_FALLBACK_IMAGE) {
                    target.src = DEFAULT_FALLBACK_IMAGE;
                  }
                }}
                className="card-article-featured-image"
              />
              <div className="card-article-featured-content">
                <div className="card-article-category">
                  {MAIN_ARTICLE.category}
                </div>
                <h3 className="card-article-featured-title">
                  {MAIN_ARTICLE.title}
                </h3>
                <p className="card-article-featured-desc">
                  {MAIN_ARTICLE.excerpt}
                </p>
                <div className="mt-auto pt-4 flex items-center justify-between text-caption text-text-secondary">
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <Clock className="w-4 h-4 text-text-secondary opacity-70" />
                      {MAIN_ARTICLE.readTime} مطالعه
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1.5 opacity-70">
                      <Calendar className="w-4 h-4" />
                      {MAIN_ARTICLE.date}
                    </span>
                  </div>
                  <span className="text-link text-body-sm group-hover:text-brand-orange transition-colors">
                    مطالعه راهنما
                  </span>
                </div>
              </div>
            </a>
          </motion.article>`;

content = content.replace(regexMain, replacementMain);

const regexSub = /\{\/\* Sub Articles Stack \*\/\}\s*<div className="lg:col-span-5 flex flex-col sm:grid sm:grid-cols-2 lg:flex lg:flex-col gap-4 justify-between">[\s\S]*?<\/div>\s*<\/div>/;

const replacementSub = `{/* Sub Articles Stack */}
          <div className="lg:col-span-5 flex flex-col sm:grid sm:grid-cols-2 lg:flex lg:flex-col gap-4 justify-between">
            {SUB_ARTICLES.map((article, idx) => (
              <motion.a 
                href={article.url}
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: (idx + 1) * 0.08 }}
                className="card-article-compact"
              >
                <div className="card-article-compact-thumbnail">
                  <img 
                    src={article.image || DEFAULT_FALLBACK_IMAGE} 
                    alt={article.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src !== DEFAULT_FALLBACK_IMAGE) {
                        target.src = DEFAULT_FALLBACK_IMAGE;
                      }
                    }}
                  />
                </div>
                <div className="card-article-compact-content">
                  <div className="card-article-category" style={{ marginBottom: '4px', fontSize: '10px' }}>
                    {article.category}
                  </div>
                  <h3 className="card-article-compact-title">
                    {article.title}
                  </h3>
                  <div className="card-article-meta mt-1">
                    <span className="inline-flex items-center gap-1 opacity-80">
                      <Clock className="w-3.5 h-3.5" />
                      {article.readTime}
                    </span>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>`;

content = content.replace(regexSub, replacementSub);
fs.writeFileSync('src/components/TravelGuide.tsx', content, 'utf8');

