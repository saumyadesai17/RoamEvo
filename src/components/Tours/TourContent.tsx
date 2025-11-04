import { TourContentProps } from '@/types/tour';

const TourContent = ({ overview, itinerary, priceIncludes, priceExcludes }: TourContentProps) => {
  return (
    <div className="flex-1 space-y-6 sm:space-y-8 lg:space-y-10 2xl:space-y-12">
      {/* Overview Section */}
      <section id="overview" className="scroll-mt-44 2xl:scroll-mt-52 text-sm sm:text-base lg:text-lg 2xl:text-xl sm:mt-6 2xl:mt-8">
        <div 
          className="space-y-3 sm:space-y-4 2xl:space-y-6 text-[#000000] leading-relaxed 2xl:leading-loose text-justify [&>p]:mb-3 [&>p]:sm:mb-4 [&>p]:2xl:mb-6 [&>h2]:text-xl [&>h2]:sm:text-2xl [&>h2]:2xl:text-3xl [&>h2]:font-semibold [&>h2]:mb-3 [&>h3]:text-lg [&>h3]:sm:text-xl [&>h3]:2xl:text-2xl [&>h3]:font-semibold [&>h3]:mb-2 [&>ul]:list-disc [&>ul]:ml-5 [&>ul]:space-y-1 [&>ol]:list-decimal [&>ol]:ml-5 [&>ol]:space-y-1 [&>strong]:font-semibold [&>em]:italic"
          dangerouslySetInnerHTML={{ __html: overview }}
        />
      </section>

      {/* Itinerary Section */}
      <section id="itinerary" className="scroll-mt-44 2xl:scroll-mt-52">
        <div className="space-y-4 sm:space-y-6 2xl:space-y-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl 2xl:text-5xl font-light text-[#4A5B2D] mb-6 sm:mb-8 lg:mb-10 2xl:mb-12">Itinerary</h2>
          <div className="relative">
            {/* Continuous timeline line - starts from below first dot and goes through all days */}
            <div className="absolute left-[43px] sm:left-[56px] lg:left-[64px] 2xl:left-[76px] top-6 sm:top-8 lg:top-10 2xl:top-12 w-px bg-[#4A5B2D]" 
                 style={{ height: `calc(100% - 3rem)` }}></div>
            
            {itinerary.map((day) => {
              const activities = day.activities?.list || [];
              const places = day.places_to_visit || [];
              
              return (
                <div key={day.id} className="relative flex mb-4 sm:mb-6 2xl:mb-8">
                  {/* Day indicator positioned to the left of the dot */}
                  <div className="flex items-start mr-2 sm:mr-3 lg:mr-4 2xl:mr-6">
                    <div className="text-left mr-2 sm:mr-3 2xl:mr-4 w-8 sm:w-10 lg:w-12 2xl:w-16 flex flex-col">
                      <div
                        className="text-xs sm:text-sm lg:text-base 2xl:text-lg uppercase font-[family-name:--font-montserrat] font-semibold tracking-wider"
                        style={{ color: '#4A5B2D99' }}
                      >
                        DAY
                      </div>
                      <div
                        className="text-2xl sm:text-3xl lg:text-4xl 2xl:text-5xl font-[family-name:--font-montserrat] leading-none font-extrabold"
                        style={{ color: '#4A5B2D', fontWeight: 800 }}
                      >
                        {String(day.day_number).padStart(2, '0')}
                      </div>
                    </div>
                    {/* Dot positioned to align with the number */}
                    <div
                      className="w-2 h-2 sm:w-2.5 sm:h-2.5 2xl:w-3 2xl:h-3 rounded-full relative z-10 mt-6 sm:mt-7 lg:mt-9 2xl:mt-11"
                      style={{ 
                        backgroundColor: '#4A5B2D'
                      }}
                    ></div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4 sm:pb-6 2xl:pb-8 pl-2 sm:pl-3 2xl:pl-4">
                    <h3 className="text-base sm:text-lg lg:text-xl 2xl:text-2xl font-semibold text-[#4A5B2DCC] mb-2 2xl:mb-3">{day.title}</h3>

                    {/* Render description as HTML */}
                    {day.description && (
                      <div 
                        className="text-sm sm:text-base 2xl:text-lg text-gray-700 mb-3 sm:mb-4 2xl:mb-6 leading-relaxed [&>p]:mb-2 [&>h2]:text-lg [&>h2]:font-semibold [&>h2]:mb-2 [&>h3]:text-base [&>h3]:font-semibold [&>h3]:mb-1 [&>ul]:list-disc [&>ul]:ml-4 [&>ul]:space-y-1 [&>ol]:list-decimal [&>ol]:ml-4 [&>ol]:space-y-1 [&>strong]:font-semibold"
                        dangerouslySetInnerHTML={{ __html: day.description }}
                      />
                    )}

                    {/* Display mood if exists */}
                    {day.mood && (
                      <div className="flex items-center gap-2 2xl:gap-3 mb-2 2xl:mb-3">
                        <div className="text-sm sm:text-base 2xl:text-lg text-gray-600">
                          <span className="font-semibold">Mood:</span> {day.mood}
                        </div>
                      </div>
                    )}

                    {/* Activities list */}
                    {activities.length > 0 && (
                      <div className="space-y-1 2xl:space-y-1.5 mb-3 sm:mb-4 2xl:mb-6">
                        {activities.map((activity: string, i: number) => (
                          <div key={i} className="flex items-start">
                            <span className="text-xs sm:text-sm lg:text-base 2xl:text-lg text-gray-700 leading-relaxed 2xl:leading-loose">{activity}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Images */}
                    {day.images && day.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 sm:gap-3 2xl:gap-4 mb-3 sm:mb-4 2xl:mb-6">
                        {day.images.map((image: string, i: number) => (
                          <div key={i} className="relative overflow-hidden rounded-lg 2xl:rounded-xl h-16 sm:h-20 lg:h-24 2xl:h-32">
                            <div
                              className="w-full h-full bg-cover bg-center"
                              style={{ backgroundImage: `url('${image}')` }}
                            ></div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Places to visit */}
                    {places.length > 0 && (
                      <div>
                        <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-[#4A5B2D] mb-2">
                          Places we recommend you to visit
                        </h4>
                        <ul className="space-y-1">
                          {places.map((place: { name: string; distance?: string }, i: number) => (
                            <li key={i} className="text-xs sm:text-sm lg:text-base text-gray-600">
                              • {place.name}{place.distance ? ` - ${place.distance}` : ''}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Things you should know Section */}
      <section id="things-to-know" className="scroll-mt-44 2xl:scroll-mt-52 mt-12 sm:mt-16 2xl:mt-20">
        <div className="space-y-4 sm:space-y-6 2xl:space-y-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl 2xl:text-5xl font-light text-[#4A5B2D] mb-6 sm:mb-8 lg:mb-10 2xl:mb-12">Things you should know</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 2xl:gap-12">
            {/* What is included */}
            <div>
              <h3 className="text-lg sm:text-xl 2xl:text-2xl font-medium text-gray-800 mb-3 sm:mb-4 2xl:mb-6">What is included in the tour</h3>
              <ul className="space-y-2 2xl:space-y-3">
                {priceIncludes.map((item: string, index: number) => (
                  <li key={index} className="flex items-center text-sm sm:text-base 2xl:text-lg text-gray-700">
                    <span className="text-gray-400 mr-2 2xl:mr-3">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* What is NOT included */}
            <div>
              <h3 className="text-lg sm:text-xl 2xl:text-2xl font-medium text-gray-800 mb-3 sm:mb-4 2xl:mb-6">What is NOT included in the tour</h3>
              <ul className="space-y-2 2xl:space-y-3">
                {priceExcludes.map((item: string, index: number) => (
                  <li key={index} className="flex items-center text-sm sm:text-base 2xl:text-lg text-gray-700">
                    <span className="text-gray-400 mr-2 2xl:mr-3">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TourContent;