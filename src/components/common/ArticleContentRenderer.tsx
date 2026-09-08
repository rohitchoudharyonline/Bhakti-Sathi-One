import React, { useState } from 'react';
import { ZoomIn, X, Lightbulb, Image as ImageIcon } from 'lucide-react';
import { useTours } from '../../context/TourContext';

interface ArticleContentRendererProps {
  content: string;
  className?: string;
}

export const ArticleContentRenderer: React.FC<ArticleContentRendererProps> = ({
  content,
  className = '',
}) => {
  const { mediaAssets } = useTours();
  const [activeLightboxImg, setActiveLightboxImg] = useState<{
    url: string;
    alt: string;
    caption?: string;
  } | null>(null);

  if (!content) return null;

  // Helper to parse inline formatting like **bold**, *italic*, and [link](url)
  const renderFormattedText = (text: string) => {
    // If text contains an inline image, render it as an image
    const inlineImgMatch = text.match(/!\[([^\]]*)\]\(([^)]+)\)(?:\s*\*Caption:\s*([^*]+)\*)?/i);
    if (inlineImgMatch) {
      const rawMeta = inlineImgMatch[1] || '';
      const imgUrl = inlineImgMatch[2];
      const inlineCaption = inlineImgMatch[3] || '';
      const metaParts = rawMeta.split('|');
      const altText = metaParts[0] || 'Article photo';
      const caption = metaParts[2] || inlineCaption || '';

      return (
        <span className="inline-block my-2 max-w-full">
          <img
            src={imgUrl}
            alt={altText}
            className="rounded-xl shadow-xs max-h-96 object-cover border border-stone-200"
            onError={(e) => {
              const currentSrc = e.currentTarget.src;
              const found = mediaAssets.find(
                (a) =>
                  a &&
                  (a.dataUrl === currentSrc ||
                    a.url === currentSrc ||
                    (a.storagePath && currentSrc.includes(a.storagePath)))
              );
              if (found?.dataUrl) {
                e.currentTarget.src = found.dataUrl;
              }
            }}
          />
          {caption && <span className="block text-[11px] text-stone-500 italic mt-1">{caption}</span>}
        </span>
      );
    }

    // Split by links [text](url) avoiding leading !
    const parts = text.split(/(?<!\!)(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*)/g);

    return parts.map((part, i) => {
      // Link [Text](URL)
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        return (
          <a
            key={i}
            href={linkMatch[2]}
            target={linkMatch[2].startsWith('http') ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className="text-[#FC3200] font-semibold underline hover:text-stone-900 transition"
          >
            {linkMatch[1]}
          </a>
        );
      }

      // Bold **text**
      const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
      if (boldMatch) {
        return <strong key={i} className="font-bold text-stone-900">{boldMatch[1]}</strong>;
      }

      // Italic *text*
      const italicMatch = part.match(/^\*([^*]+)\*$/);
      if (italicMatch) {
        return <em key={i} className="italic">{italicMatch[1]}</em>;
      }

      return part;
    });
  };

  // Helper to split raw content into clean blocks, isolating image syntax
  const prepareBlocks = (rawContent: string): string[] => {
    const normalized = rawContent.replace(/\r\n/g, '\n');
    const initialBlocks = normalized.split(/\n\s*\n/);
    const finalBlocks: string[] = [];

    for (const block of initialBlocks) {
      const trimmed = block.trim();
      if (!trimmed) continue;

      // Extract markdown image tags if embedded with other text
      const imagePattern = /(!\[[^\]]*\]\([^)]+\)(?:\s*\*Caption:\s*[^*]+\*)?)/gi;
      if (imagePattern.test(trimmed)) {
        const parts = trimmed.split(imagePattern);
        for (const part of parts) {
          const pTrimmed = part.trim();
          if (pTrimmed) finalBlocks.push(pTrimmed);
        }
      } else {
        finalBlocks.push(trimmed);
      }
    }

    return finalBlocks;
  };

  const blocks = prepareBlocks(content);

  return (
    <div className={`space-y-6 text-stone-800 leading-relaxed ${className}`}>
      {blocks.map((block, idx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // 1. Markdown Image Syntax ![alt|alignment|caption](url)
        const mdImgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)(?:\s*\*Caption:\s*([^*]+)\*)?/i);
        if (mdImgMatch) {
          const rawMeta = mdImgMatch[1] || '';
          const imgUrl = mdImgMatch[2];
          const inlineCaption = mdImgMatch[3] || '';

          // Meta format: "Alt Text|alignment|caption"
          const metaParts = rawMeta.split('|');
          const altText = metaParts[0] || 'Article photo';
          const alignment = metaParts[1]?.toLowerCase().trim() || 'center'; // 'center', 'left', 'right'
          const caption = metaParts[2] || inlineCaption || '';

          let containerClasses = 'my-6 text-center';
          let imgClasses = 'w-full max-w-3xl h-auto rounded-2xl shadow-sm mx-auto object-cover border border-stone-200/80';

          if (alignment === 'left') {
            containerClasses = 'my-4 sm:float-left sm:mr-6 sm:mb-4 w-full sm:w-1/2 md:w-2/5';
            imgClasses = 'w-full h-auto rounded-2xl shadow-sm object-cover border border-stone-200/80';
          } else if (alignment === 'right') {
            containerClasses = 'my-4 sm:float-right sm:ml-6 sm:mb-4 w-full sm:w-1/2 md:w-2/5';
            imgClasses = 'w-full h-auto rounded-2xl shadow-sm object-cover border border-stone-200/80';
          }

          return (
            <figure key={idx} className={containerClasses}>
              <div className="relative group overflow-hidden rounded-2xl inline-block w-full">
                <img
                  src={imgUrl}
                  alt={altText}
                  className={`${imgClasses} cursor-zoom-in transition duration-300 group-hover:scale-[1.02]`}
                  onClick={() => setActiveLightboxImg({ url: imgUrl, alt: altText, caption })}
                  loading="lazy"
                  onError={(e) => {
                    // Search mediaAssets in context for matching dataUrl if remote R2 URL is unresolved
                    const targetSrc = e.currentTarget.src;
                    const matched = mediaAssets.find((a) => {
                      if (!a) return false;
                      if (a.url && targetSrc.includes(a.url)) return true;
                      if (a.dataUrl && targetSrc.includes(a.dataUrl)) return true;
                      if (a.storagePath && targetSrc.includes(a.storagePath)) return true;
                      if (
                        a.name &&
                        targetSrc
                          .toLowerCase()
                          .includes(a.name.toLowerCase().replace(/\.[^/.]+$/, ''))
                      )
                        return true;
                      return false;
                    });

                    if (matched?.dataUrl && e.currentTarget.src !== matched.dataUrl) {
                      e.currentTarget.src = matched.dataUrl;
                    } else if (!e.currentTarget.src.includes('unsplash.com')) {
                      // Fallback HD destination image if missing
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80';
                    }
                  }}
                />
                <button
                  onClick={() => setActiveLightboxImg({ url: imgUrl, alt: altText, caption })}
                  className="absolute bottom-3 right-3 p-2 bg-black/70 hover:bg-black text-white rounded-xl text-xs font-bold opacity-0 group-hover:opacity-100 transition shadow-md backdrop-blur-xs flex items-center gap-1 cursor-pointer"
                  title="Expand Full Photo"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Zoom</span>
                </button>
              </div>
              {caption && (
                <figcaption className="text-xs text-stone-500 mt-2 font-medium italic">
                  {caption}
                </figcaption>
              )}
            </figure>
          );
        }

        // 2. Heading 2
        if (trimmed.startsWith('## ')) {
          const headingText = trimmed.replace('## ', '').trim();
          const id = headingText
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
          return (
            <h2
              key={idx}
              id={id}
              className="text-xl sm:text-2xl font-black text-stone-900 mt-8 mb-4 pt-4 border-t border-stone-100 scroll-mt-24 tracking-tight"
            >
              {headingText}
            </h2>
          );
        }

        // 3. Heading 3
        if (trimmed.startsWith('### ')) {
          const headingText = trimmed.replace('### ', '').trim();
          return (
            <h3
              key={idx}
              className="text-lg sm:text-xl font-bold text-stone-900 mt-6 mb-3 tracking-tight"
            >
              {headingText}
            </h3>
          );
        }

        // 4. Heading 4
        if (trimmed.startsWith('#### ')) {
          const headingText = trimmed.replace('#### ', '').trim();
          return (
            <h4
              key={idx}
              className="text-base sm:text-lg font-bold text-stone-900 mt-4 mb-2"
            >
              {headingText}
            </h4>
          );
        }

        // 5. Blockquote / Tip Callout
        if (trimmed.startsWith('> ')) {
          const isTip = trimmed.includes('💡') || trimmed.toLowerCase().includes('tip:');
          const cleanText = trimmed.replace(/^>\s*/gm, '');

          if (isTip) {
            return (
              <div
                key={idx}
                className="my-5 p-4 sm:p-5 bg-amber-50/80 border-l-4 border-amber-500 rounded-r-2xl shadow-2xs space-y-1"
              >
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-900">
                  <Lightbulb className="w-4 h-4 text-amber-600 fill-amber-300" />
                  <span>Pro Traveler Tip</span>
                </div>
                <div className="text-sm text-stone-800 font-medium">
                  {renderFormattedText(cleanText.replace(/^[💡\s*Tip:\s*]+/i, ''))}
                </div>
              </div>
            );
          }

          return (
            <blockquote
              key={idx}
              className="my-5 border-l-4 border-stone-900 bg-stone-50 p-4 rounded-r-2xl italic text-stone-700 text-sm sm:text-base font-serif"
            >
              {renderFormattedText(cleanText)}
            </blockquote>
          );
        }

        // 6. Horizontal Rule
        if (trimmed === '---') {
          return <hr key={idx} className="my-8 border-stone-200" />;
        }

        // 7. Bullet List
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const items = trimmed.split('\n').filter((l) => l.trim().startsWith('- ') || l.trim().startsWith('* '));
          return (
            <ul key={idx} className="my-4 space-y-2 pl-5 list-disc text-stone-700">
              {items.map((item, i) => (
                <li key={i} className="text-sm sm:text-base">
                  {renderFormattedText(item.replace(/^[-*]\s+/, ''))}
                </li>
              ))}
            </ul>
          );
        }

        // 8. Numbered List
        if (/^\d+\.\s+/.test(trimmed)) {
          const items = trimmed.split('\n').filter((l) => /^\d+\.\s+/.test(l.trim()));
          return (
            <ol key={idx} className="my-4 space-y-2 pl-5 list-decimal text-stone-700">
              {items.map((item, i) => (
                <li key={i} className="text-sm sm:text-base">
                  {renderFormattedText(item.replace(/^\d+\.\s+/, ''))}
                </li>
              ))}
            </ol>
          );
        }

        // 9. Markdown Table (| Col 1 | Col 2 |)
        if (trimmed.startsWith('|')) {
          const lines = trimmed.split('\n').filter((l) => l.trim().startsWith('|'));
          if (lines.length >= 2) {
            const headers = lines[0]
              .split('|')
              .map((c) => c.trim())
              .filter(Boolean);
            const rows = lines
              .slice(2)
              .map((line) =>
                line
                  .split('|')
                  .map((c) => c.trim())
                  .filter(Boolean)
              );

            return (
              <div key={idx} className="my-6 overflow-x-auto rounded-2xl border border-stone-200 shadow-2xs bg-white">
                <table className="w-full text-xs sm:text-sm text-left text-stone-800">
                  <thead className="bg-stone-100 text-stone-900 font-bold uppercase text-[11px] tracking-wider border-b border-stone-200">
                    <tr>
                      {headers.map((h, i) => (
                        <th key={i} className="px-4 py-3">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-stone-50/80 transition">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-4 py-3 font-medium">
                            {renderFormattedText(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
        }

        // 10. Raw HTML snippet support (<figure...>, <img...>)
        if (trimmed.startsWith('<figure') || trimmed.startsWith('<img')) {
          return (
            <div
              key={idx}
              className="my-6 overflow-hidden rounded-2xl"
              dangerouslySetInnerHTML={{ __html: trimmed }}
            />
          );
        }

        // 11. Standard Paragraph
        return (
          <p key={idx} className="text-stone-700 leading-relaxed text-sm sm:text-base">
            {renderFormattedText(trimmed)}
          </p>
        );
      })}

      {/* Lightbox Modal */}
      {activeLightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setActiveLightboxImg(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveLightboxImg(null)}
              className="absolute -top-10 right-0 p-2 text-white hover:text-amber-400 bg-white/10 hover:bg-white/20 rounded-full transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={activeLightboxImg.url}
              alt={activeLightboxImg.alt}
              className="max-h-[80vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
            />
            {activeLightboxImg.caption && (
              <p className="text-xs sm:text-sm text-stone-300 font-medium text-center max-w-xl italic">
                {activeLightboxImg.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
